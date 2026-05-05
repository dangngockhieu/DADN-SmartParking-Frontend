import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/auth-pages.css'

const AUTH_NOTICE_KEY = 'auth_landing_notice'

function AuthLanding() {
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const savedNotice = sessionStorage.getItem(AUTH_NOTICE_KEY)
    if (savedNotice) {
      setNotice(savedNotice)
      sessionStorage.removeItem(AUTH_NOTICE_KEY)
    }
  }, [])

  return (
    <div className="auth-page auth-home-page">
      <div className="page-wrapper">
        <section className="hero-card">
          <span className="badge">Smart Parking</span>
          <h1 className="main-title">Hệ thống bãi đỗ xe thông minh</h1>
          <p className="main-subtitle">
            Quản lý bãi đỗ xe theo thời gian thực, theo dõi trạng thái và tối ưu luồng xe.
          </p>
          <p
            className={`auth-feedback ${notice ? 'is-info' : 'is-hidden'}`}
          >
            {notice || 'Không có thông báo'}
          </p>
          <div className="action-group">
            <Link className="btn btn-primary" to="/login">
              Đăng nhập
            </Link>
            <Link className="btn btn-secondary" to="/register">
              Tạo tài khoản
            </Link>
          </div>
          <p className="signup-text">
            Quên mật khẩu?{' '}
            <Link className="link-like" to="/forgot-password">
              Khôi phục tài khoản
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default AuthLanding