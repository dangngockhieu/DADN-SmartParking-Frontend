import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/authService'
import '../../styles/auth-pages.css'

const initialForm = {
	first_name: '',
	last_name: '',
	email: '',
	password: '',
}

function Register() {
	const navigate = useNavigate()
	const [form, setForm] = useState(initialForm)
	const [showPassword, setShowPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [feedback, setFeedback] = useState({ type: '', message: '' })

	const handleChange = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setFeedback({ type: '', message: '' })

		if (!form.first_name || !form.last_name || !form.email || !form.password) {
			setFeedback({
				type: 'is-error',
				message: 'Vui lòng nhập đầy đủ thông tin đăng ký.',
			})
			return
		}

		setIsSubmitting(true)
		try {
			const response = await register(form)
			const apiData = response?.data
			if (apiData?.success) {
				setFeedback({
					type: 'is-success',
					message: apiData.message || 'Đăng ký thành công. Hãy kiểm tra email để xác thực.',
				})
				navigate('/login')
				return
			}

			setFeedback({
				type: 'is-error',
				message: apiData?.message || 'Đăng ký thất bại, vui lòng thử lại.',
			})
		} catch (error) {
			const serverErrors = error?.response?.data?.errors
			const serverMessage = error?.response?.data?.message
			console.log('Đăng ký lỗi:', error)
			setFeedback({
				type: 'is-error',
				message:
					(Array.isArray(serverErrors) && serverErrors[0]) ||
					serverMessage ||
					'Không thể đăng ký, vui lòng thử lại.',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="auth-page auth-signup-page">
			<div className="page-wrapper">
				<section className="signup-card">
					<span className="chip">Smart Parking</span>
					<h1 className="signup-header">Tạo tài khoản mới</h1>
					<p className="desc">
						Hoàn thiện thông tin để truy cập vào hệ thống quản lý bãi đỗ.
					</p>
					<form className="auth-form" onSubmit={handleSubmit}>
						<div className="split-row">
							<div className="input-group">
								<label className="label-text" htmlFor="register-first-name">
									First name
								</label>
								<input
									id="register-first-name"
									name="first_name"
									type="text"
									className="input-field"
									placeholder="Nguyen"
									value={form.first_name}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="input-group">
								<label className="label-text" htmlFor="register-last-name">
									Last name
								</label>
								<input
									id="register-last-name"
									name="last_name"
									type="text"
									className="input-field"
									placeholder="Van A"
									value={form.last_name}
									onChange={handleChange}
									required
								/>
							</div>
						</div>
						<div className="input-group">
							<label className="label-text" htmlFor="register-email">
								Email
							</label>
							<input
								id="register-email"
								name="email"
								type="email"
								className="input-field"
								placeholder="name@email.com"
								value={form.email}
								onChange={handleChange}
								autoComplete="email"
								required
							/>
						</div>
						<div className="input-group">
							<label className="label-text" htmlFor="register-password">
								Mật khẩu
							</label>
							<div className="password-box">
								<input
									id="register-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									className="input-field"
									placeholder="Tao mat khau"
									placeholder="Tạo mật khẩu"
									value={form.password}
									onChange={handleChange}
									autoComplete="new-password"
									required
								/>
								<button
									type="button"
									className="toggle-btn"
									onClick={() => setShowPassword((prev) => !prev)}
								>
									{showPassword ? 'Ẩn' : 'Hiện'}
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
								{isSubmitting ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
							</button>
							<Link className="btn btn-back" to="/login">
								Đã có tài khoản? Đăng nhập
							</Link>
							<Link className="btn btn-back" to="/">
								Quay lại trang chủ
							</Link>
						</div>
					</form>
				</section>
			</div>
		</div>
	)
}

export default Register
