import { useCallback, useEffect, useState } from 'react';
import { getParkingFlow } from '../services/dashboardService';

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  // Backend đang nhận format yyyy-mm-dd, ví dụ: 2026-05-02.
  return `${year}-${month}-${day}`;
}

function getErrorMessage(error) {
  // Backend thường trả message trong response.data.message, còn lỗi mạng sẽ nằm ở error.message.
  return error?.response?.data?.message || error?.message || 'Không thể tải dữ liệu dashboard';
}

function normalizeFilters(filters) {
  return {
    date: filters.date,
    // lotId rỗng/null/undefined nghĩa là lấy toàn bộ bãi, nên không gửi lên API.
    lotId: filters.lotId || undefined,
  };
}

function useDashboard(initialFilters = {}) {
  const [filters, setFilters] = useState({
    date: initialFilters.date || getTodayDateString(),
    lotId: initialFilters.lotId || '',
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchParkingFlow = useCallback(async (nextFilters = filters) => {
    const requestFilters = normalizeFilters(nextFilters);

    if (!requestFilters.date) {
      setError('Vui lòng chọn ngày để xem dữ liệu dashboard');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getParkingFlow(requestFilters);

      // API trả về { success, message, data }, trong đó data mới là dữ liệu dashboard cần hiển thị.
      const nextDashboardData = response?.data?.data || null;
      setDashboardData(nextDashboardData);
      return nextDashboardData;
    } catch (apiError) {
      setError(getErrorMessage(apiError));
      setDashboardData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((nextFilters) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchParkingFlow(filters));
  }, [fetchParkingFlow, filters]);

  return {
    dashboardData,
    filters,
    loading,
    error,
    fetchParkingFlow,
    updateFilters,
  };
}

export default useDashboard;
