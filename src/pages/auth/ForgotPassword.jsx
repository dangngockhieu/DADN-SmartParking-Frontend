import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendResetPassword } from '../../services/authService'
import '../../styles/auth-pages.css'

const RESET_EMAIL_KEY = 'reset_email'

function ForgotPassword() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [feedback, setFeedback] = useState({ type: '', message: '' })

	const handleSubmit = async (event) => {
		event.preventDefault()
		setFeedback({ type: '', message: '' })

		if (!email) {
			setFeedback({ type: 'is-error', message: 'Vui lòng nhập email để khôi phục.' })
			return
		}

		setIsSubmitting(true)
		try {
			const response = await sendResetPassword({ email })
			const apiData = response?.data
			if (apiData?.success) {
				sessionStorage.setItem(RESET_EMAIL_KEY, email)
				setFeedback({
					type: 'is-success',
					message: apiData.message || 'Đã gửi email khôi phục. Hãy kiểm tra hộp thư.',
				})
				navigate('/reset-verify')
				return
			}

			setFeedback({
				type: 'is-error',
				message: apiData?.message || 'Không thể gửi email khôi phục.',
			})
		} catch (error) {
			const serverErrors = error?.response?.data?.errors
			const serverMessage = error?.response?.data?.message
			setFeedback({
				type: 'is-error',
				message:
					(Array.isArray(serverErrors) && serverErrors[0]) ||
					serverMessage ||
					'Không thể gửi email khôi phục, vui lòng thử lại.',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="auth-page auth-forgot-page">
			<div className="page-wrapper">
				<section className="recover-card">
					<span className="chip">Khôi phục tài khoản</span>
					<h1 className="login-header">Quên mật khẩu</h1>
					<p className="desc">
						Nhập email đã đăng ký. Hệ thống sẽ gửi mã xác thực để tạo mật khẩu mới.
					</p>
					<form className="form-container" onSubmit={handleSubmit}>
						<div className="input-group">
							<label className="label-text" htmlFor="forgot-email">
								Email
							</label>
							<input
								id="forgot-email"
								type="email"
								className="input-field"
								placeholder="name@email.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</div>
						<p
							className={`lookup-feedback ${
								feedback.message ? feedback.type : 'is-hidden'
							}`}
						>
							{feedback.message || 'Không có thông báo'}
						</p>
						<div className="button-group">
							<button className="btn btn-info" type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Đang gửi...' : 'Gửi mã xác thực'}
							</button>
							<Link className="btn btn-back" to="/login">
								Quay lại đăng nhập
							</Link>
						</div>
					</form>
				</section>
			</div>
		</div>
	)
}

export default ForgotPassword
