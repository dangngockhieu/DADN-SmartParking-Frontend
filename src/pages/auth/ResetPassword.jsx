import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../services/authService'
import '../../styles/auth-pages.css'

const RESET_EMAIL_KEY = 'reset_email'
const RESET_CODE_KEY = 'reset_code'

function ResetPassword() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [code, setCode] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [feedback, setFeedback] = useState({ type: '', message: '' })

	useEffect(() => {
		const savedEmail = sessionStorage.getItem(RESET_EMAIL_KEY)
		const savedCode = sessionStorage.getItem(RESET_CODE_KEY)
		if (savedEmail) {
			setEmail(savedEmail)
		}
		if (savedCode) {
			setCode(savedCode)
		}
	}, [])

	const handleSubmit = async (event) => {
		event.preventDefault()
		setFeedback({ type: '', message: '' })

		if (!email || !code || !newPassword || !confirmPassword) {
			setFeedback({ type: 'is-error', message: 'Vui lòng nhập đầy đủ thông tin.' })
			return
		}

		if (newPassword !== confirmPassword) {
			setFeedback({ type: 'is-error', message: 'Xác nhận mật khẩu không khớp.' })
			return
		}

		setIsSubmitting(true)
		try {
			const response = await resetPassword({
				email,
				code,
				new_password: newPassword,
				confirm_password: confirmPassword,
			})
			const apiData = response?.data
			if (apiData?.success) {
				sessionStorage.removeItem(RESET_EMAIL_KEY)
				sessionStorage.removeItem(RESET_CODE_KEY)
				setFeedback({
					type: 'is-success',
					message: apiData.message || 'Đặt lại mật khẩu thành công.',
				})
				navigate('/login')
				return
			}

			setFeedback({
				type: 'is-error',
				message: apiData?.message || 'Không thể đặt lại mật khẩu.',
			})
		} catch (error) {
			const serverErrors = error?.response?.data?.errors
			const serverMessage = error?.response?.data?.message
			setFeedback({
				type: 'is-error',
				message:
					(Array.isArray(serverErrors) && serverErrors[0]) ||
					serverMessage ||
					'Không thể đặt lại mật khẩu, vui lòng thử lại.',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="auth-page auth-reset-password-page">
			<div className="page-wrapper">
				<section className="recover-card">
					<span className="chip">Đặt lại mật khẩu</span>
					<h1 className="login-header">Tạo mật khẩu mới</h1>
					<p className="desc">
						Nhập mã xác thực và mật khẩu mới để hoàn tất quá trình khôi phục.
					</p>
					<form className="form-container" onSubmit={handleSubmit}>
						<div className="input-group">
							<label className="label-text" htmlFor="reset-email">
								Email
							</label>
							<input
								id="reset-email"
								type="email"
								className="input-field"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="name@email.com"
								required
							/>
						</div>
						<div className="input-group">
							<label className="label-text" htmlFor="reset-code">
								Mã xác thực
							</label>
							<input
								id="reset-code"
								type="text"
								className="input-field"
								value={code}
								onChange={(event) => setCode(event.target.value)}
								placeholder="Nhập mã xác thực"
								required
							/>
						</div>
						<div className="input-group">
							<label className="label-text" htmlFor="reset-new-password">
								Mật khẩu mới
							</label>
							<div className="password-box">
								<input
									id="reset-new-password"
									type={showNewPassword ? 'text' : 'password'}
									className="input-field"
									value={newPassword}
									onChange={(event) => setNewPassword(event.target.value)}
									placeholder="Tạo mật khẩu mới"
									required
								/>
								<button
									type="button"
									className="toggle-btn"
									onClick={() => setShowNewPassword((prev) => !prev)}
								>
									{showNewPassword ? 'Ẩn' : 'Hiện'}
								</button>
							</div>
						</div>
						<div className="input-group">
							<label className="label-text" htmlFor="reset-confirm-password">
								Xác nhận mật khẩu
							</label>
							<div className="password-box">
								<input
									id="reset-confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									className="input-field"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									placeholder="Nhập lại mật khẩu"
									required
								/>
								<button
									type="button"
									className="toggle-btn"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
								>
									{showConfirmPassword ? 'Ẩn' : 'Hiện'}
								</button>
							</div>
						</div>
						<p
							className={`auth-feedback ${
								feedback.message ? feedback.type : 'is-hidden'
							}`}
						>
							{feedback.message || 'Không có thông báo'}
						</p>
						<div className="button-group">
							<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
							</button>
							<Link className="btn btn-back" to="/forgot-password">
								Quay lại đăng nhập
							</Link>
						</div>
					</form>
				</section>
			</div>
		</div>
	)
}

export default ResetPassword
