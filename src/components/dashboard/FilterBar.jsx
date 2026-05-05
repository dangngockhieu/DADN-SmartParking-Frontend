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
    <div className="dashboard-filters" aria-label="Bo loc dashboard">
      <label>
        Ngay
        <div className="filter-control">
          <span className="filter-symbol">D</span>
          <input type="date" value={filters.date} onChange={onDateChange} />
        </div>
      </label>

      <label>
        Khu vuc
        <div className="filter-control filter-control-wide">
          <span className="filter-symbol">L</span>
          <select value={filters.lotId} onChange={onLotIdChange} disabled={parkingLotsLoading}>
            <option value="">Toan bo bai</option>
            {parkingLots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name}
              </option>
            ))}
          </select>
        </div>
      </label>

      <button type="button" onClick={onRefresh} disabled={loading}>
        {loading ? 'Dang tai...' : 'Tai lai'}
      </button>

      {parkingLotsError && <span className="filter-hint">{parkingLotsError}</span>}
    </div>
  );
}

export default FilterBar;
