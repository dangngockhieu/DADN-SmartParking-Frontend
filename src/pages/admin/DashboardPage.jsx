import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  return error?.response?.data?.message || error?.message || 'Không thể tải danh sách bãi xe';
}

function DashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
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
      description: 'Tổng xe vào',
      label: 'Tổng xe vào hôm nay',
      tone: 'blue',
      value: `${summary?.todayIn ?? 0} xe`,
    },
    {
      description: 'Tổng xe ra',
      label: 'Tổng xe ra hôm nay',
      tone: 'yellow',
      value: `${summary?.todayOut ?? 0} xe`,
    },
    {
      description: `${summary?.availableSlots ?? 0} chỗ trống / ${summary?.capacity ?? 0} sức chứa`,
      label: 'Xe hiện đang trong bãi',
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
          aria-label="Về sơ đồ bãi đỗ"
          onClick={() => navigate('/map')}
        >
          <span className="material-icons">arrow_back</span>
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
              Đăng xuất
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-hero">
            <p className="dashboard-eyebrow">{dashboardData?.lotName || 'Toàn bộ bãi'}</p>
            <h1>Biểu đồ lưu lượng xe hàng ngày</h1>

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

          <section className="summary-grid" aria-label="Thống kê tổng quan">
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
          aria-label="Đóng cài đặt"
          onClick={() => setIsSidebarOpen(false)}
        >
          <span className="material-icons">close</span>
        </button>
        <h2>Cài đặt</h2>
        <button
          className="dashboard-sidebar-btn"
          type="button"
          onClick={() => navigate('/change-password')}
        >
          Đổi mật khẩu
        </button>
        <button type="button" className="dashboard-sidebar-btn logout" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          <span>Đăng xuất</span>
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
