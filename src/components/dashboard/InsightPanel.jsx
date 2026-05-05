function InsightPanel({ insights, summary }) {
  const peakTime = insights?.peakTime;

  return (
    <aside className="insight-panel">
      <h2>Thong tin bo sung</h2>

      <div className="insight-list">
        <article className="insight-item">
          <span className="insight-icon insight-icon-blue">T</span>
          <div>
            <span>Khung gio cao diem</span>
            <strong>{peakTime?.from || '--:--'} - {peakTime?.to || '--:--'}</strong>
          </div>
        </article>

        <article className="insight-item">
          <span className="insight-icon insight-icon-slate">P</span>
          <div>
            <span>Ty le lap day bai</span>
            <strong>{summary?.occupancyRate ?? 0}%</strong>
          </div>
        </article>

        <article className="insight-item">
          <span className="insight-icon insight-icon-green">S</span>
          <div>
            <span>Trang thai hien tai</span>
            <strong>{insights?.statusMessage || 'Chua co du lieu'}</strong>
          </div>
        </article>
      </div>
    </aside>
  );
}

export default InsightPanel;
