import { formatDisplayValue, STATUS_LABELS } from './rfidCardUtils'

function RfidCardDetailModal({ card, onClose, onEdit }) {
	const cardType = card.cardType || card.registerStatus || card.status
	const usageStatus = card.usageStatus || (card.isActive ? 'ACTIVE' : 'INACTIVE')

	const details = [
		{ label: 'Mã thẻ', value: card.uid },
		{ label: 'Biển số', value: card.plateNumber },
		{ label: 'Tên user', value: card.ownerName },
		{ label: 'Email', value: card.email },
		{ label: 'Trạng thái đăng ký', value: STATUS_LABELS[cardType] || cardType },
		{ label: 'Trạng thái hoạt động', value: STATUS_LABELS[usageStatus] || usageStatus },
		{ label: 'Ngày đăng ký', value: card.registeredAt },
		{ label: 'ID user', value: card.userId },
		{ label: 'ID thẻ', value: card.id },
	]

	return (
		<div className="rfid-modal-backdrop" role="presentation">
			<section className="rfid-modal" role="dialog" aria-modal="true" aria-labelledby="rfid-card-detail-title">
				<header>
					<div>
						<p>Chi tiết</p>
						<h2 id="rfid-card-detail-title">Thông tin thẻ RFID</h2>
					</div>
					<button className="rfid-modal-close" type="button" aria-label="Đóng" onClick={onClose}>
						<span className="material-icons">close</span>
					</button>
				</header>

				<div className="rfid-detail-list">
					{details.map((item) => (
						<div className="rfid-detail-item" key={item.label}>
							<span>{item.label}</span>
							<strong>{formatDisplayValue(item.value)}</strong>
						</div>
					))}
				</div>

				<div className="rfid-modal-actions rfid-detail-actions">
					<button type="button" onClick={onClose}>
						Đóng
					</button>
					<button className="rfid-primary-btn" type="button" onClick={() => onEdit(card)}>
						Sửa thẻ này
					</button>
				</div>
			</section>
		</div>
	)
}

export default RfidCardDetailModal
