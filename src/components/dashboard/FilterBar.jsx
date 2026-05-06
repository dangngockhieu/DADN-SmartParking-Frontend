function FilterBar({
  filters,
  loading,
  parkingLots,
  parkingLotsError,
  parkingLotsLoading,
  onDateChange,
  onLotIdChange,
  onRefresh,
}) {
  return (
    <div className="dashboard-filters" aria-label="Bộ lọc dashboard">
      <label>
        Ngày
        <div className="filter-control">
          <span className="filter-symbol">D</span>
          <input type="date" value={filters.date} onChange={onDateChange} />
        </div>
      </label>

      <label>
        Khu vực
        <div className="filter-control filter-control-wide">
          <span className="filter-symbol">L</span>
          <select value={filters.lotId} onChange={onLotIdChange} disabled={parkingLotsLoading}>
            <option value="">Toàn bộ bãi</option>
            {parkingLots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name}
              </option>
            ))}
          </select>
        </div>
      </label>

      <button type="button" onClick={onRefresh} disabled={loading}>
        {loading ? 'Đang tải...' : 'Tải lại'}
      </button>

      {parkingLotsError && <span className="filter-hint">{parkingLotsError}</span>}
    </div>
  );
}

export default FilterBar;
