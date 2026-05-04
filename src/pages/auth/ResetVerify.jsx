import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendResetPassword } from '../../services/authService'
import '../../styles/auth-pages.css'

const RESET_EMAIL_KEY = 'reset_email'
const RESET_CODE_KEY = 'reset_code'

function ResetVerify() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [code, setCode] = useState('')
	const [isResending, setIsResending] = useState(false)
	const [feedback, setFeedback] = useState({ type: '', message: '' })

	useEffect(() => {
		const savedEmail = sessionStorage.getItem(RESET_EMAIL_KEY)
		if (savedEmail) {
			setEmail(savedEmail)
		}
	}, [])

	const handleSubmit = (event) => {
		event.preventDefault()
		setFeedback({ type: '', message: '' })

		if (!email || !code) {
			setFeedback({ type: 'is-error', message: 'Vui lòng nhập email và mã xác thực.' })
			return
		}

		sessionStorage.setItem(RESET_EMAIL_KEY, email)
		sessionStorage.setItem(RESET_CODE_KEY, code)
		navigate('/reset-password')
	}

	const handleResend = async () => {
		setFeedback({ type: '', message: '' })
		if (!email) {
			setFeedback({ type: 'is-error', message: 'Vui lòng nhập email trước khi gửi lại.' })
			return
		}

		setIsResending(true)
		try {
			const response = await sendResetPassword({ email })
			const apiData = response?.data
			if (apiData?.success) {
				setFeedback({
					type: 'is-success',
					message: apiData.message || 'Đã gửi lại mã xác thực. Hãy kiểm tra email.',
				})
				return
			}

			setFeedback({
				type: 'is-error',
				message: apiData?.message || 'Không thể gửi lại mã xác thực.',
			})
		} catch (error) {
			const serverErrors = error?.response?.data?.errors
			const serverMessage = error?.response?.data?.message
			setFeedback({
				type: 'is-error',
				message:
					(Array.isArray(serverErrors) && serverErrors[0]) ||
					serverMessage ||
					'Không thể gửi lại mã xác thực, vui lòng thử lại.',
			})
		} finally {
			setIsResending(false)
		}
	}

	return (
		<div className="auth-page auth-reset-verify-page">
			<div className="page-wrapper">
				<section className="recover-card">
					<span className="chip">Xác thực reset</span>
					<h1 className="login-header">Nhập mã xác thực</h1>
					<p className="desc">
						Nhập mã xác thực vừa được gửi tới email để tiếp tục đặt lại mật khẩu.
					</p>
					<form className="form-container" onSubmit={handleSubmit}>
						<div className="input-group">
							<label className="label-text" htmlFor="verify-email">
								Email
							</label>
							<input
								id="verify-email"
								type="email"
								className="input-field"
								placeholder="name@email.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</div>
						<div className="input-group">
							<label className="label-text" htmlFor="verify-code">
								Mã xác thực
							</label>
							<input
								id="verify-code"
								type="text"
								className="input-field"
								placeholder="Nhập mã 6 ký tự"
								value={code}
								onChange={(event) => setCode(event.target.value)}
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
						<div className="timer-section">
							<p className="recovery-email">Không nhận được mã?</p>
							<button
								type="button"
								className="resend-btn"
								onClick={handleResend}
								disabled={isResending}
							>
								{isResending ? 'Đang gửi...' : 'Gửi lại mã xác thực'}
							</button>
						</div>
						<div className="button-group">
							<button className="btn btn-primary" type="submit">
								Tiếp tục đặt lại mật khẩu
							</button>
							<Link className="btn btn-back" to="/forgot-password">
								Quay lại
							</Link>
						</div>
					</form>
				</section>
			</div>
		</div>
	)
}

export default ResetVerify
