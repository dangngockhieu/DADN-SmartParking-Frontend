function InsightPanel({ insights, summary }) {
  const peakTime = insights?.peakTime;

  return (
    <aside className="insight-panel">
      <h2>Thông tin bổ sung</h2>

      <div className="insight-list">
        <article className="insight-item">
          <span className="insight-icon insight-icon-blue">T</span>
          <div>
            <span>Khung giờ cao điểm</span>
            <strong>{peakTime?.from || '--:--'} - {peakTime?.to || '--:--'}</strong>
          </div>
        </article>

        <article className="insight-item">
          <span className="insight-icon insight-icon-slate">P</span>
          <div>
            <span>Tỷ lệ lấp đầy bãi</span>
            <strong>{summary?.occupancyRate ?? 0}%</strong>
          </div>
        </article>

        <article className="insight-item">
          <span className="insight-icon insight-icon-green">S</span>
          <div>
            <span>Trạng thái hiện tại</span>
            <strong>{insights?.statusMessage || 'Chưa có dữ liệu'}</strong>
          </div>
        </article>
      </div>
    </aside>
  );
}

export default InsightPanel;
