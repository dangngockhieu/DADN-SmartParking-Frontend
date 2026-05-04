import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'
import '../styles/map-page.css'

const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function Map() {
	const navigate = useNavigate()
	const [now, setNow] = useState(new Date())
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)

	useEffect(() => {
		document.body.classList.add('is-logged-in')
		document.body.classList.remove('is-logged-out')
		const timer = setInterval(() => setNow(new Date()), 1000)
		return () => {
			document.body.classList.remove('is-logged-in')
			clearInterval(timer)
		}
	}, [])

	const timeLabel = useMemo(() => {
		const hours = String(now.getHours()).padStart(2, '0')
		const minutes = String(now.getMinutes()).padStart(2, '0')
		return `${hours}:${minutes}`
	}, [now])

	const dateLabel = useMemo(() => {
		const day = dayNames[now.getDay()]
		const date = String(now.getDate()).padStart(2, '0')
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const year = now.getFullYear()
		return `${day}, ngày ${date} tháng ${month} năm ${year}`
	}, [now])

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			// Ignore logout errors for now.
		}
		navigate('/')
	}

	return (
		<div className="map-page">
			<div className="clock-card">
				<div className="clock-time">{timeLabel}</div>
				<div className="clock-date">{dateLabel}</div>
			</div>

			<div className="slot-stats">
				<div className="stats-col">
					<div className="stats-title">Trống</div>
					<div className="available-count stats-value">0/0</div>
				</div>
				<div className="stats-divider"></div>
				<div className="stats-col">
					<div className="stats-title">Đã đỗ</div>
					<div className="occupied-count stats-value">0/0</div>
				</div>
			</div>

			<div className="top-right-actions">
				<button
					type="button"
					className="corner-btn open-settings auth-only"
					onClick={() => setIsSidebarOpen(true)}
				>
					<span className="material-icons setting-btn">settings</span>
				</button>
				<button type="button" className="corner-btn auth-only">
					<img
						className="dashboard-btn"
						src="../src/assets/MapPage/DashboardIcon.svg"
						alt="Dashboard"
					/>
				</button>
				<button type="button" className="corner-btn auth-only">
					<span className="material-icons card-btn">credit_card</span>
				</button>
			</div>

			<div className="map-wrapper">
				<div className="map-container" />
			</div>

			<div id="global-error-toast" className="error-toast" />

			<button className="reload-btn" type="button" disabled>
				<img src="../src/assets/MapPage/ReloadIcon.svg" alt="Reload" />
			</button>

			<div className="up-arrow">↑</div>

			<div className={`settings-sidebar ${isSidebarOpen ? 'active' : ''}`}>
				<div className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
					❌
				</div>
				<h2>Cài đặt</h2>
				<button className="sidebar-btn" type="button">
					<Link to="/change-password">
						Đặt lại mật khẩu
					</Link>
				</button>
				<button type="button" className="sidebar-btn logout" onClick={handleLogout}>
					<span className="material-icons">logout</span>
					<span>Đăng xuất</span>
				</button>
			</div>
		</div>
	)
}

export default Map
