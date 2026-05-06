import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyRfidCard } from '../api/myRfidCardApi'
import RfidCardStats from '../components/rfid-card-management/RfidCardStats'
import {
	formatDisplayValue,
	getApiData,
	getErrorMessage,
	normalizeRfidCard,
	STATUS_CLASS_NAMES,
	STATUS_LABELS,
} from '../components/rfid-card-management/rfidCardUtils'
import '../styles/rfid-card-management.css'

const getStoredUser = () => {
	try {
		const rawUser = localStorage.getItem('user_info')
		return rawUser ? JSON.parse(rawUser) : null
	} catch {
		return null
	}
}

function MyRfidCardStatusPage() {
	const navigate = useNavigate()
	const [currentUser] = useState(getStoredUser)
	const [card, setCard] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const loadCard = useCallback(async () => {
		setLoading(true)
		setError('')

		try {
			const response = await getMyRfidCard()
			const apiData = getApiData(response)
			setCard(apiData ? normalizeRfidCard(apiData, { fallbackEmail: currentUser?.email }) : null)
		} catch (apiError) {
			setError(getErrorMessage(apiError, 'Không thể tải trạng thái thẻ. Vui lòng thử lại.'))
			setCard(null)
		} finally {
			setLoading(false)
		}
	}, [currentUser])

	useEffect(() => {
		const timer = window.setTimeout(() => {
			void loadCard()
		}, 0)

		return () => window.clearTimeout(timer)
	}, [loadCard])

	const stats = useMemo(() => {
		return [
			{ icon: 'T', label: 'Thẻ của tôi', tone: 'blue', value: card ? 1 : 0 },
			{
				icon: 'ĐK',
				label: 'Trạng thái đăng ký',
				tone: card?.registerStatus === 'REGISTERED' ? 'green' : 'amber',
				value: card ? STATUS_LABELS[card.registerStatus] || card.registerStatus : 'Chưa có thẻ',
			},
			{
				icon: 'ON',
				label: 'Trạng thái sử dụng',
				tone: card?.isActive ? 'cyan' : 'amber',
				value: card ? STATUS_LABELS[card.usageStatus] || 'Chưa rõ' : 'Chưa có thẻ',
			},
		]
	}, [card])

	const userDisplayName = [currentUser?.first_name || currentUser?.firstName, currentUser?.last_name || currentUser?.lastName]
		.filter(Boolean)
		.join(' ')
	const avatarText = (currentUser?.first_name || currentUser?.firstName || currentUser?.email || 'U').charAt(0).toUpperCase()

	return (
		<main className="rfid-page">
			<nav className="rfid-actions" aria-label="Điều hướng trạng thái thẻ">
				<button
					type="button"
					className="rfid-action-btn"
					aria-label="Quay lại bản đồ"
					onClick={() => navigate('/map')}
				>
					<span className="material-icons">arrow_back</span>
				</button>
			</nav>

			<section className="rfid-shell">
				<header className="rfid-topbar">
					<div className="rfid-brand">
						<span className="rfid-brand-mark">P</span>
						<strong>SMART PARKING DASHBOARD</strong>
					</div>

					<div className="rfid-admin">
						<span className="rfid-admin-avatar">{avatarText}</span>
						<div>
							<strong>{userDisplayName || currentUser?.email || 'Người dùng'}</strong>
							<span>{currentUser?.email || 'Chưa có email'}</span>
						</div>
					</div>
				</header>

				<div className="rfid-content">
					<section className="rfid-page-heading">
						<div>
							<p>Tài khoản cá nhân</p>
							<h1>Trạng thái thẻ của tôi</h1>
							<span className="my-rfid-subtitle">
								Mỗi tài khoản chỉ được đăng ký một thẻ RFID. Thông tin bên dưới là thẻ đang gắn với tài khoản hiện tại.
							</span>
						</div>
					</section>

					<RfidCardStats loading={loading} stats={stats} />

					{error && (
						<section className="rfid-error-state" role="alert">
							<p>{error}</p>
							<button type="button" onClick={loadCard}>
								Thử lại
							</button>
						</section>
					)}

					{!error && (
						<section className="rfid-table-card">
							<div className="rfid-table-scroll">
								<table className="rfid-table my-rfid-table">
									<thead>
										<tr>
											<th>Mã thẻ</th>
											<th>Biển số</th>
											<th>Email</th>
											<th>Trạng thái đăng ký</th>
											<th>Trạng thái sử dụng</th>
											<th>Ngày đăng ký</th>
										</tr>
									</thead>
									<tbody>
										{loading && (
											<tr>
												<td><span className="rfid-table-skeleton rfid-table-skeleton-short" /></td>
												<td><span className="rfid-table-skeleton" /></td>
												<td><span className="rfid-table-skeleton rfid-table-skeleton-wide" /></td>
												<td><span className="rfid-table-skeleton rfid-table-skeleton-badge" /></td>
												<td><span className="rfid-table-skeleton rfid-table-skeleton-badge" /></td>
												<td><span className="rfid-table-skeleton" /></td>
											</tr>
										)}

										{!loading && card && (
											<tr>
												<td><strong>{formatDisplayValue(card.uid)}</strong></td>
												<td>{formatDisplayValue(card.plateNumber)}</td>
												<td>{formatDisplayValue(card.email)}</td>
												<td>
													<span className={`rfid-status ${STATUS_CLASS_NAMES[card.registerStatus] || ''}`}>
														{STATUS_LABELS[card.registerStatus] || formatDisplayValue(card.registerStatus)}
													</span>
												</td>
												<td>
													<span className={`rfid-status ${STATUS_CLASS_NAMES[card.usageStatus] || ''}`}>
														{STATUS_LABELS[card.usageStatus] || formatDisplayValue(card.usageStatus)}
													</span>
												</td>
												<td>{formatDisplayValue(card.registeredAt)}</td>
											</tr>
										)}

										{!loading && !card && (
											<tr>
												<td className="rfid-empty-state" colSpan="6">
													Tài khoản hiện tại chưa có thẻ RFID.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</section>
					)}
				</div>
			</section>
		</main>
	)
}

export default MyRfidCardStatusPage
