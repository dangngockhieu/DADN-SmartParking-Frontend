import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FilterBar from '../../components/dashboard/FilterBar';
import InsightPanel from '../../components/dashboard/InsightPanel';
import ParkingFlowChart from '../../components/dashboard/ParkingFlowChart';
import SummaryCard from '../../components/dashboard/SummaryCard';
import useDashboard from '../../hooks/useDashboard';
import { logout } from '../../services/authService';
import { getParkingLots } from '../../services/parkingLotService';
import { setAccessToken } from '../../utils/axiosInterceptor';
import '../../styles/dashboard.css';

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Khong the tai danh sach bai xe';
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const isAdmin = String(user?.role ?? '').toUpperCase() === 'ADMIN';
  const {
    dashboardData,
    filters,
    loading,
    error,
    fetchParkingFlow,
    updateFilters,
  } = useDashboard();
  const [parkingLots, setParkingLots] = useState([]);
  const [parkingLotsLoading, setParkingLotsLoading] = useState(false);
  const [parkingLotsError, setParkingLotsError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const summary = dashboardData?.summary;
  const insights = dashboardData?.insights;
  const hourlyFlow = dashboardData?.hourlyFlow || [];

  const summaryCards = [
    {
      description: 'Tong xe vao xe',
      label: 'Tong xe vao hom nay',
      tone: 'blue',
      value: `${summary?.todayIn ?? 0} xe`,
    },
    {
      description: 'Tong xe ra xe',
      label: 'Tong xe ra hom nay',
      tone: 'yellow',
      value: `${summary?.todayOut ?? 0} xe`,
    },
    {
      description: `${summary?.availableSlots ?? 0} cho trong / ${summary?.capacity ?? 0} suc chua`,
      label: 'Xe hien dang trong bai',
      tone: 'green',
      value: `${summary?.currentVehicles ?? 0} xe`,
    },
  ];

  function handleDateChange(event) {
    updateFilters({
      date: event.target.value,
    });
  }

  function handleLotIdChange(event) {
    updateFilters({
      lotId: event.target.value,
    });
  }

  function handleRefresh() {
    fetchParkingFlow(filters);
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      localStorage.removeItem('user_info');
      setAccessToken(null);
      navigate('/');
    }
  }

  useEffect(() => {
    async function fetchParkingLots() {
      setParkingLotsLoading(true);
      setParkingLotsError('');

      try {
        const response = await getParkingLots();

        // API tra ve { success, message, data }, data la mang bai xe.
        setParkingLots(response?.data?.data || []);
      } catch (apiError) {
        setParkingLots([]);
        setParkingLotsError(getErrorMessage(apiError));
      } finally {
        setParkingLotsLoading(false);
      }
    }

    fetchParkingLots();
  }, []);

  return (
    <main className="dashboard-page">
      <nav className="dashboard-actions" aria-label="Dieu huong dashboard">
        <button
          type="button"
          className="dashboard-action-btn"
          aria-label="Mo cai dat"
          onClick={() => setIsSidebarOpen(true)}
        >
          <span className="material-icons">settings</span>
        </button>

        <button
          type="button"
          className="dashboard-action-btn"
          aria-label="Ve so do bai do"
          onClick={() => navigate('/map')}
        >
          <span className="material-icons">map</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            className={`dashboard-action-btn ${location.pathname === '/admin/rfid-cards' ? 'dashboard-action-btn-active' : ''}`}
            aria-label="Quan ly the xe"
            onClick={() => navigate('/admin/rfid-cards')}
          >
            <span className="material-icons">credit_card</span>
          </button>
        )}

        <button
          type="button"
          className="dashboard-action-btn"
          aria-label="Tai lai dashboard"
          onClick={handleRefresh}
          disabled={loading}
        >
          <span className={`material-icons ${loading ? 'spinning-icon-clockwise' : ''}`}>
            sync
          </span>
        </button>
      </nav>

      <section className="dashboard-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">P</span>
            <strong>SMART PARKING DASHBOARD</strong>
          </div>

          <div className="admin-menu">
            <span className="admin-avatar">{user?.first_name?.[0] || 'A'}</span>
            <div>
              <strong>{user?.first_name || 'Admin'}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="logout-button" type="button" onClick={handleLogout}>
              Dang xuat
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-hero">
            <p className="dashboard-eyebrow">{dashboardData?.lotName || 'Toan bo bai'}</p>
            <h1>Bieu do luu luong xe hang ngay</h1>

            <FilterBar
              filters={filters}
              loading={loading}
              parkingLots={parkingLots}
              parkingLotsError={parkingLotsError}
              parkingLotsLoading={parkingLotsLoading}
              onDateChange={handleDateChange}
              onLotIdChange={handleLotIdChange}
              onRefresh={handleRefresh}
            />
          </section>

          {error && <p className="dashboard-error">{error}</p>}

          <section className="dashboard-main-grid">
            <ParkingFlowChart hourlyFlow={hourlyFlow} />
            <InsightPanel insights={insights} summary={summary} />
          </section>

          <section className="summary-grid" aria-label="Thong ke tong quan">
            {summaryCards.map((card) => (
              <SummaryCard
                description={card.description}
                key={card.label}
                label={card.label}
                tone={card.tone}
                value={card.value}
              />
            ))}
          </section>
        </div>
      </section>

      <aside className={`dashboard-settings-sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <button
          type="button"
          className="dashboard-sidebar-close"
          aria-label="Dong cai dat"
          onClick={() => setIsSidebarOpen(false)}
        >
          <span className="material-icons">close</span>
        </button>
        <h2>Cai dat</h2>
        <button
          className="dashboard-sidebar-btn"
          type="button"
          onClick={() => navigate('/change-password')}
        >
          Doi mat khau
        </button>
        <button type="button" className="dashboard-sidebar-btn logout" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          <span>Dang xuat</span>
        </button>
      </aside>
    </main>
  );
}

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem('user_info');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export default DashboardPage;
