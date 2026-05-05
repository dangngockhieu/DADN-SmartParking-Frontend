import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changePassword } from '../services/changePasswordService'
import '../styles/auth-pages.css'

const initialErrors = {
	current: '',
	newPassword: '',
	confirm: '',
}

function ChangePassword() {
	const navigate = useNavigate()
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showCurrent, setShowCurrent] = useState(false)
	const [showNew, setShowNew] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [errors, setErrors] = useState(initialErrors)
	const [feedback, setFeedback] = useState({ type: '', message: '' })
	const [isSubmitting, setIsSubmitting] = useState(false)

	const validate = () => {
		const nextErrors = { ...initialErrors }
		let hasError = false

		if (!currentPassword) {
			nextErrors.current = 'Vui lòng nhập mật khẩu hiện tại.'
			hasError = true
		}
		if (!newPassword) {
			nextErrors.newPassword = 'Vui lòng nhập mật khẩu mới.'
			hasError = true
		}
		if (!confirmPassword) {
			nextErrors.confirm = 'Vui lòng nhập lại mật khẩu mới.'
			hasError = true
		} else if (newPassword && newPassword !== confirmPassword) {
			nextErrors.confirm = 'Xác nhận mật khẩu không khớp.'
			hasError = true
		}

		setErrors(nextErrors)
		return !hasError
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setFeedback({ type: '', message: '' })

		if (!validate()) {
			return
		}

		setIsSubmitting(true)
		try {
			const response = await changePassword({
				old_password: currentPassword,
				new_password: newPassword,
				confirm_password: confirmPassword,
			})
			const apiData = response?.data
			if (apiData?.success) {
				setFeedback({
					type: 'is-success',
					message: apiData.message || 'Đổi mật khẩu thành công.',
				})
				navigate('/map')
				return
			}
			setFeedback({
				type: 'is-error',
				message: apiData?.message || 'Không thể đổi mật khẩu.',
			})
		} catch (error) {
			const serverErrors = error?.response?.data?.errors
			const serverMessage = error?.response?.data?.message
			setFeedback({
				type: 'is-error',
				message:
					(Array.isArray(serverErrors) && serverErrors[0]) ||
					serverMessage ||
					'Không thể đổi mật khẩu, vui lòng thử lại.',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="change-password-example">
			<div className="password-page-wrapper">
				<form className="password-container" onSubmit={handleSubmit}>
					<div className="back-btn" onClick={() => navigate('/map')}>
						<span className="material-icons">arrow_back</span> Quay lại
					</div>
					<h2 style={{ textAlign: 'center', margin: 0 }}>Đổi mật khẩu</h2>

					<div className="input-group">
						<label>Mật khẩu hiện tại</label>
						<div className="input-wrapper">
							<input
								type={showCurrent ? 'text' : 'password'}
								className={`current-pass ${errors.current ? 'input-error' : ''}`}
								placeholder="Nhập mật khẩu hiện tại"
								value={currentPassword}
								onChange={(event) => setCurrentPassword(event.target.value)}
							/>
							<span
								className="material-icons toggle-password"
								onClick={() => setShowCurrent((prev) => !prev)}
							>
								{showCurrent ? 'visibility' : 'visibility_off'}
							</span>
						</div>
						<span className="error-msg">{errors.current}</span>
					</div>

					<div className="input-group">
						<label>Mật khẩu mới</label>
						<div className="input-wrapper">
							<input
								type={showNew ? 'text' : 'password'}
								className={`new-pass ${errors.newPassword ? 'input-error' : ''}`}
								placeholder="Nhập mật khẩu mới"
								value={newPassword}
								onChange={(event) => setNewPassword(event.target.value)}
							/>
							<span
								className="material-icons toggle-password"
								onClick={() => setShowNew((prev) => !prev)}
							>
								{showNew ? 'visibility' : 'visibility_off'}
							</span>
						</div>
						<span className="error-msg">{errors.newPassword}</span>
					</div>

					<div className="input-group">
						<label>Xác nhận mật khẩu</label>
						<div className="input-wrapper">
							<input
								type={showConfirm ? 'text' : 'password'}
								className={`confirm-pass ${errors.confirm ? 'input-error' : ''}`}
								placeholder="Nhập lại mật khẩu mới"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
							/>
							<span
								className="material-icons toggle-password"
								onClick={() => setShowConfirm((prev) => !prev)}
							>
								{showConfirm ? 'visibility' : 'visibility_off'}
							</span>
						</div>
						<span className="error-msg">{errors.confirm}</span>
					</div>

					<p
						className={`auth-feedback ${feedback.message ? feedback.type : 'is-hidden'}`}
					>
						{feedback.message || 'Không có thông báo'}
					</p>
					<button className="submit-btn" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
					</button>
				</form>
			</div>
		</div>
	)
}

export default ChangePassword
