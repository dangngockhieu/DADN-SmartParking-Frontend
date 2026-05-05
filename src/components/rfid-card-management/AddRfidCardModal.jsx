import { useState } from 'react'
import { CARD_TYPE_OPTIONS, isValidEmail } from './rfidCardUtils'

const initialForm = {
	uid: '',
	cardType: 'REGISTERED',
	email: '',
}

function AddRfidCardModal({ open, loading, error, onClose, onSubmit }) {
	const [form, setForm] = useState(initialForm)
	const [validationError, setValidationError] = useState('')

	if (!open) {
		return null
	}

	const handleClose = () => {
		if (loading) {
			return
		}

		setForm(initialForm)
		setValidationError('')
		onClose()
	}

	const handleChange = (event) => {
		const { name, value } = event.target

		setForm((previousForm) => ({
			...previousForm,
			[name]: value,
		}))
		setValidationError('')
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		const uid = form.uid.trim()
		const email = form.email.trim()

		if (!uid) {
			setValidationError('Vui lòng nhập mã thẻ RFID / UID.')
			return
		}

		if (form.cardType === 'REGISTERED' && !email) {
			setValidationError('Thẻ đã đăng ký cần có email user để liên kết tài khoản.')
			return
		}

		if (email && !isValidEmail(email)) {
			setValidationError('Email chưa đúng định dạng.')
			return
		}

		try {
			await onSubmit({
				uid,
				card_type: form.cardType,
				email,
			})

			setForm(initialForm)
		} catch {
			// Parent component owns the API error message shown in this modal.
		}
	}

	const feedbackMessage = validationError || error

	return (
		<div className="rfid-modal-backdrop" role="presentation">
			<section className="rfid-modal" role="dialog" aria-modal="true" aria-labelledby="add-rfid-card-title">
				<header>
					<div>
						<p>Thêm mới</p>
						<h2 id="add-rfid-card-title">Thẻ xe RFID</h2>
					</div>
					<button className="rfid-modal-close" type="button" aria-label="Đóng" onClick={handleClose} disabled={loading}>
						<span className="material-icons">close</span>
					</button>
				</header>

				<form className="rfid-modal-form" onSubmit={handleSubmit}>
					<label>
						<span>Mã thẻ RFID / UID</span>
						<input
							name="uid"
							type="text"
							placeholder="VD: TX001 hoặc A1B2C3D4"
							value={form.uid}
							onChange={handleChange}
						/>
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

					{feedbackMessage && <p className="rfid-modal-error">{feedbackMessage}</p>}

					<div className="rfid-modal-actions">
						<button type="button" onClick={handleClose} disabled={loading}>
							Hủy
						</button>
						<button className="rfid-primary-btn" type="submit" disabled={loading}>
							{loading ? 'Đang lưu...' : 'Lưu thẻ'}
						</button>
					</div>
				</form>
			</section>
		</div>
	)
}

export default AddRfidCardModal
