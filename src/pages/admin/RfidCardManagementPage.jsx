import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	createRfidCard,
	getRfidCardStatistics,
	getRfidCards,
	getUserIdByEmail,
	updateRfidCard,
} from '../../api/rfidCardApi'
import AddRfidCardModal from '../../components/rfid-card-management/AddRfidCardModal'
import EditRfidCardModal from '../../components/rfid-card-management/EditRfidCardModal'
import RfidCardDetailModal from '../../components/rfid-card-management/RfidCardDetailModal'
import RfidCardPagination from '../../components/rfid-card-management/RfidCardPagination'
import RfidCardStats from '../../components/rfid-card-management/RfidCardStats'
import RfidCardTable from '../../components/rfid-card-management/RfidCardTable'
import RfidCardToolbar from '../../components/rfid-card-management/RfidCardToolbar'
import DashboardIcon from '../../assets/MapPage/DashboardIcon.svg'
import {
	buildStats,
	filterRfidCards,
	getApiData,
	getCardListFromResponse,
	getErrorMessage,
	normalizeRfidCard,
} from '../../components/rfid-card-management/rfidCardUtils'
import '../../styles/rfid-card-management.css'

function RfidCardManagementPage() {
	const navigate = useNavigate()
	const [cards, setCards] = useState([])
	const [apiStats, setApiStats] = useState(null)
	const [keyword, setKeyword] = useState('')
	const [status, setStatus] = useState('ALL')
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(6)
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [viewingCard, setViewingCard] = useState(null)
	const [selectedCard, setSelectedCard] = useState(null)
	const [isCardsLoading, setIsCardsLoading] = useState(true)
	const [isStatsLoading, setIsStatsLoading] = useState(true)
	const [isCreating, setIsCreating] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)
	const [listError, setListError] = useState('')
	const [createError, setCreateError] = useState('')
	const [updateError, setUpdateError] = useState('')

	const refreshRfidData = useCallback(async ({ showLoading = false } = {}) => {
		if (showLoading) {
			setIsCardsLoading(true)
			setIsStatsLoading(true)
		}

		setListError('')

		const [cardsResult, statsResult] = await Promise.allSettled([
			getRfidCards({ page: 1, pageSize: 1000 }),
			getRfidCardStatistics(),
		])

		if (cardsResult.status === 'fulfilled') {
			const nextCards = getCardListFromResponse(cardsResult.value).map(normalizeRfidCard)
			setCards(nextCards)
		} else {
			setListError('Không thể tải danh sách thẻ. Vui lòng thử lại.')
		}

		if (statsResult.status === 'fulfilled') {
			setApiStats(getApiData(statsResult.value))
		}

		setIsCardsLoading(false)
		setIsStatsLoading(false)
	}, [])

	useEffect(() => {
		const timer = window.setTimeout(() => {
			void refreshRfidData({ showLoading: true })
		}, 0)

		return () => window.clearTimeout(timer)
	}, [refreshRfidData])

	const handleCreateRfidCard = async (payload) => {
		setIsCreating(true)
		setCreateError('')

		try {
			const requestPayload = { ...payload }
			const { email } = requestPayload
			delete requestPayload.email
			const normalizedEmail = String(email ?? '').trim()

			if (requestPayload.card_type === 'REGISTERED' && normalizedEmail) {
				const userResponse = await getUserIdByEmail(normalizedEmail)
				requestPayload.user_id = getApiData(userResponse)?.user_id ?? null
			}

			await createRfidCard(requestPayload)
			await refreshRfidData()
			setIsAddModalOpen(false)
			setCurrentPage(1)
		} catch (error) {
			setCreateError(getErrorMessage(error, 'Không thể thêm thẻ mới, vui lòng thử lại.'))
			throw error
		} finally {
			setIsCreating(false)
		}
	}

	const handleUpdateRfidCard = async (id, payload) => {
		setIsUpdating(true)
		setUpdateError('')

		try {
			const requestPayload = { ...payload }
			const { email } = requestPayload
			delete requestPayload.email

			if (requestPayload.card_type === 'REGISTERED') {
				const normalizedEmail = String(email ?? '').trim()
				if (normalizedEmail) {
					const userResponse = await getUserIdByEmail(normalizedEmail)
					requestPayload.user_id = getApiData(userResponse)?.user_id ?? null
				} else {
					requestPayload.user_id = selectedCard?.userId ?? null
				}
			}

			await updateRfidCard(id, requestPayload)
			await refreshRfidData()
			setSelectedCard(null)
		} catch (error) {
			setUpdateError(getErrorMessage(error, 'Không thể cập nhật thẻ, vui lòng thử lại.'))
			throw error
		} finally {
			setIsUpdating(false)
		}
	}

	const filteredCards = useMemo(() => {
		return filterRfidCards({ cards, keyword, status })
	}, [cards, keyword, status])

	const stats = useMemo(() => {
		return buildStats({ apiStats, cards })
	}, [apiStats, cards])

	const todayNewCards = apiStats?.registeredOnDate ?? apiStats?.todayNew ?? apiStats?.newToday ?? apiStats?.today ?? 0
	const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize))
	const visibleCards = filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	const hasSearchOrFilter = Boolean(keyword.trim()) || status !== 'ALL'
	const emptyMessage = hasSearchOrFilter
		? 'Không có kết quả phù hợp với từ khóa tìm kiếm'
		: 'Không tìm thấy thẻ xe nào'

	const handleKeywordChange = (nextKeyword) => {
		setKeyword(nextKeyword)
		setCurrentPage(1)
	}

	const handleStatusChange = (nextStatus) => {
		setStatus(nextStatus)
		setCurrentPage(1)
	}

	const handlePageSizeChange = (nextPageSize) => {
		setPageSize(nextPageSize)
		setCurrentPage(1)
	}

	const handleOpenAddModal = () => {
		setCreateError('')
		setIsAddModalOpen(true)
	}

	const handleOpenEditModal = (card) => {
		setUpdateError('')
		setViewingCard(null)
		setSelectedCard(card)
	}

	return (
		<main className="rfid-page">
			<nav className="rfid-actions" aria-label="Điều hướng quản trị">
				<button
					type="button"
					className="rfid-action-btn"
					aria-label="Về sơ đồ bãi đỗ"
					onClick={() => navigate('/map')}
				>
					<span className="material-icons">map</span>
				</button>

				<button
					type="button"
					className="rfid-action-btn"
					aria-label="Dashboard"
					onClick={() => navigate('/admin/dashboard')}
				>
					<img className="dashboard-btn" src={DashboardIcon} alt="" />
				</button>

				<button
					type="button"
					className="rfid-action-btn rfid-action-btn-active"
					aria-label="Quản lý thẻ xe"
					aria-current="page"
				>
					<span className="material-icons">credit_card</span>
				</button>
			</nav>

			<section className="rfid-shell">
				<header className="rfid-topbar">
					<div className="rfid-brand">
						<span className="rfid-brand-mark">P</span>
						<strong>SMART PARKING DASHBOARD</strong>
					</div>

					<div className="rfid-admin">
						<span className="rfid-admin-avatar">A</span>
						<div>
							<strong>Admin</strong>
							<span>Quản trị viên</span>
						</div>
					</div>
				</header>

				<div className="rfid-content">
					<section className="rfid-page-heading">
						<div>
							<p>Quản trị hệ thống</p>
							<h1>Quản lý thẻ xe</h1>
						</div>
						<aside className="rfid-quick-info">
							<span>Thẻ mới hôm nay</span>
							<strong>{todayNewCards} thẻ</strong>
						</aside>
					</section>

					<RfidCardToolbar
						keyword={keyword}
						status={status}
						onKeywordChange={handleKeywordChange}
						onStatusChange={handleStatusChange}
						onAddClick={handleOpenAddModal}
					/>

					<RfidCardStats loading={isStatsLoading} stats={stats} />

					{listError && (
						<section className="rfid-error-state" role="alert">
							<p>{listError}</p>
							<button type="button" onClick={() => refreshRfidData({ showLoading: true })}>
								Thử lại
							</button>
						</section>
					)}

					{!listError && (
						<RfidCardTable
							cards={visibleCards}
							emptyMessage={emptyMessage}
							loading={isCardsLoading}
							onView={setViewingCard}
							onEdit={handleOpenEditModal}
						/>
					)}

					{!isCardsLoading && !listError && (
						<RfidCardPagination
							currentPage={currentPage}
							pageSize={pageSize}
							totalItems={filteredCards.length}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							onPageSizeChange={handlePageSizeChange}
						/>
					)}

					<section className="rfid-admin-note">
						<h2>Ghi chú quản trị viên</h2>
						<p>Thẻ chưa đăng ký cần được xác minh trước khi sử dụng.</p>
						<p>Vui lòng kiểm tra và cập nhật thông tin người dùng định kỳ.</p>
					</section>
				</div>
			</section>

			<AddRfidCardModal
				open={isAddModalOpen}
				loading={isCreating}
				error={createError}
				onClose={() => setIsAddModalOpen(false)}
				onSubmit={handleCreateRfidCard}
			/>

			{viewingCard && (
				<RfidCardDetailModal
					card={viewingCard}
					onClose={() => setViewingCard(null)}
					onEdit={handleOpenEditModal}
				/>
			)}

			{selectedCard && (
				<EditRfidCardModal
					key={selectedCard.id}
					card={selectedCard}
					loading={isUpdating}
					error={updateError}
					onClose={() => setSelectedCard(null)}
					onSubmit={handleUpdateRfidCard}
				/>
			)}
		</main>
	)
}

export default RfidCardManagementPage
