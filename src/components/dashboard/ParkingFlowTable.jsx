function ParkingFlowTable({ hourlyFlow, peakTime }) {
  const rows = hourlyFlow || [];

  return (
    <section className="flow-panel">
      <div className="flow-panel-header">
        <div>
          <h2>Luu luong theo gio</h2>
          <p>
            Gio cao diem: {peakTime?.from || '--:--'} den {peakTime?.to || '--:--'}
          </p>
        </div>
      </div>

      <div className="flow-table-wrapper">
        <table className="flow-table">
          <thead>
            <tr>
              <th>Gio</th>
              <th>Xe vao</th>
              <th>Xe ra</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((item) => (
                <tr key={item.hour}>
                  <td>{item.hour}</td>
                  <td>{item.in}</td>
                  <td>{item.out}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">Chua co du lieu theo gio</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ParkingFlowTable;
