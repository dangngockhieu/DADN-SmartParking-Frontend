import {
	formatDisplayValue,
	STATUS_CLASS_NAMES,
	STATUS_LABELS,
} from './rfidCardUtils'

const skeletonRows = Array.from({ length: 6 }, (_, index) => index + 1)

function RfidCardTable({ cards, emptyMessage, loading, onView, onEdit }) {
	return (
		<section className="rfid-table-card">
			<div className="rfid-table-scroll">
				<table className="rfid-table">
					<thead>
						<tr>
							<th>Mã thẻ</th>
							<th>Biển số</th>
							<th>Tên user</th>
							<th>Email</th>
							<th>Trạng thái đăng ký</th>
							<th>Trạng thái sử dụng</th>
							<th>Ngày đăng ký</th>
							<th>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{loading && skeletonRows.map((row) => (
							<tr key={row}>
								<td><span className="rfid-table-skeleton rfid-table-skeleton-short" /></td>
								<td><span className="rfid-table-skeleton" /></td>
								<td><span className="rfid-table-skeleton" /></td>
								<td><span className="rfid-table-skeleton rfid-table-skeleton-wide" /></td>
								<td><span className="rfid-table-skeleton rfid-table-skeleton-badge" /></td>
								<td><span className="rfid-table-skeleton rfid-table-skeleton-badge" /></td>
								<td><span className="rfid-table-skeleton" /></td>
								<td><span className="rfid-table-skeleton rfid-table-skeleton-actions" /></td>
							</tr>
						))}

						{!loading && cards.map((card) => (
							<tr key={card.id}>
								<td>
									<strong>{formatDisplayValue(card.uid)}</strong>
								</td>
								<td>{formatDisplayValue(card.plateNumber)}</td>
								<td>{formatDisplayValue(card.ownerName)}</td>
								<td>{formatDisplayValue(card.email)}</td>
								<td>
									<span className={`rfid-status ${STATUS_CLASS_NAMES[card.registerStatus] || ''}`}>
										{STATUS_LABELS[card.registerStatus] || formatDisplayValue(card.registerStatus)}
									</span>
								</td>
								<td>
									<span className={`rfid-status ${STATUS_CLASS_NAMES[card.usageStatus] || ''}`}>
										{STATUS_LABELS[card.usageStatus] || formatDisplayValue(card.usageStatus)}
									</span>
								</td>
								<td>{formatDisplayValue(card.registeredAt)}</td>
								<td>
									<div className="rfid-row-actions">
										<button type="button" onClick={() => onView(card)}>
											Xem
										</button>
										<button type="button" onClick={() => onEdit(card)}>
											Sửa
										</button>
									</div>
								</td>
							</tr>
						))}

						{!loading && cards.length === 0 && (
							<tr>
								<td className="rfid-empty-state" colSpan="8">
									{emptyMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	)
}

export default RfidCardTable
