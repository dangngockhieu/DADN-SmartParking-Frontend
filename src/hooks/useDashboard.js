import { useCallback, useEffect, useState } from 'react';
import { getParkingFlow } from '../services/dashboardService';

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  // Backend dang nhan format yyyy-mm-dd, vi du: 2026-05-02.
  return `${year}-${month}-${day}`;
}

function getErrorMessage(error) {
  // Backend thuong tra message trong response.data.message, con loi mang se nam o error.message.
  return error?.response?.data?.message || error?.message || 'Khong the tai du lieu dashboard';
}

function normalizeFilters(filters) {
  return {
    date: filters.date,
    // lotId rong/null/undefined nghia la lay toan bo bai, nen khong gui len API.
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
      setError('Vui long chon ngay de xem du lieu dashboard');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getParkingFlow(requestFilters);

      // API tra ve { success, message, data }, trong do data moi la du lieu dashboard can hien thi.
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
