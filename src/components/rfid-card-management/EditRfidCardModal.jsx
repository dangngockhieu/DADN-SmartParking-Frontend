import { useState } from 'react'
import { CARD_TYPE_OPTIONS, DISPLAY_EMPTY, isValidEmail } from './rfidCardUtils'

const getInitialForm = (card) => ({
	uid: card?.uid || '',
	cardType: card?.cardType || card?.status || 'GUEST',
	email: card?.email === DISPLAY_EMPTY ? '' : card?.email || '',
	isActive: Boolean(card?.isActive),
})

function EditRfidCardModal({ card, loading, error, onClose, onSubmit }) {
	const [form, setForm] = useState(() => getInitialForm(card))
	const [validationError, setValidationError] = useState('')

	const handleClose = () => {
		if (loading) {
			return
		}

		setValidationError('')
		onClose()
	}

	const handleChange = (event) => {
		const { checked, name, type, value } = event.target

		setForm((previousForm) => ({
			...previousForm,
			[name]: type === 'checkbox' ? checked : value,
		}))
		setValidationError('')
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		const email = form.email.trim()

		if (form.cardType === 'REGISTERED' && !email && !card?.userId) {
			setValidationError('Thẻ đã đăng ký cần có email user hoặc ID user hiện có.')
			return
		}

		if (email && !isValidEmail(email)) {
			setValidationError('Email chưa đúng định dạng.')
			return
		}

		try {
			await onSubmit(card.id, {
				card_type: form.cardType,
				email,
				is_active: form.isActive,
			})
		} catch {
			// Parent component owns the API error message shown in this modal.
		}
	}

	const feedbackMessage = validationError || error

	return (
		<div className="rfid-modal-backdrop" role="presentation">
			<section className="rfid-modal" role="dialog" aria-modal="true" aria-labelledby="edit-rfid-card-title">
				<header>
					<div>
						<p>Cập nhật</p>
						<h2 id="edit-rfid-card-title">Sửa thẻ RFID</h2>
					</div>
					<button className="rfid-modal-close" type="button" aria-label="Đóng" onClick={handleClose} disabled={loading}>
						<span className="material-icons">close</span>
					</button>
				</header>

				<form className="rfid-modal-form" onSubmit={handleSubmit}>
					<label>
						<span>Mã thẻ RFID / UID</span>
						<input name="uid" type="text" value={form.uid} readOnly />
					</label>
					<label>
						<span>Loại thẻ / trạng thái đăng ký</span>
						<select name="cardType" value={form.cardType} onChange={handleChange}>
							{CARD_TYPE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label>
						<span>Email</span>
						<input
							name="email"
							type="email"
							placeholder="user@email.com"
							value={form.email}
							onChange={handleChange}
						/>
					</label>
					<label className="rfid-checkbox-field">
						<input
							name="isActive"
							type="checkbox"
							checked={form.isActive}
							onChange={handleChange}
						/>
						<span>Kích hoạt thẻ</span>
					</label>

					{feedbackMessage && <p className="rfid-modal-error">{feedbackMessage}</p>}

					<div className="rfid-modal-actions">
						<button type="button" onClick={handleClose} disabled={loading}>
							Hủy
						</button>
						<button className="rfid-primary-btn" type="submit" disabled={loading}>
							{loading ? 'Đang lưu...' : 'Cập nhật thẻ'}
						</button>
					</div>
				</form>
			</section>
		</div>
	)
}

export default EditRfidCardModal
