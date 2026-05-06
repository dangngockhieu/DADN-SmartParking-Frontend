export const DISPLAY_EMPTY = '—'

export const CARD_TYPE_OPTIONS = [
	{ label: 'Đã đăng ký', value: 'REGISTERED' },
	{ label: 'Chưa đăng ký', value: 'GUEST' },
]

export const STATUS_LABELS = {
	ACTIVE: 'Đang hoạt động',
	GUEST: 'Chưa đăng ký',
	INACTIVE: 'Chưa kích hoạt',
	REGISTERED: 'Đã đăng ký',
	UNREGISTERED: 'Chưa đăng ký',
}

export const STATUS_CLASS_NAMES = {
	ACTIVE: 'rfid-status-active',
	GUEST: 'rfid-status-unregistered',
	INACTIVE: 'rfid-status-unregistered',
	REGISTERED: 'rfid-status-registered',
	UNREGISTERED: 'rfid-status-unregistered',
}

export const getApiData = (response) => response?.data?.data ?? response?.data

export const getCardListFromResponse = (response) => {
	const data = getApiData(response)

	if (Array.isArray(data)) {
		return data
	}

	return data?.items || data?.content || data?.cards || data?.data || []
}

export const getErrorMessage = (error, fallbackMessage) => {
	return error?.response?.data?.message || error?.message || fallbackMessage
}

export const formatDisplayValue = (value) => {
	return value === null || value === undefined || value === '' ? DISPLAY_EMPTY : value
}

export const formatDate = (value) => {
	if (!value) {
		return DISPLAY_EMPTY
	}

	const date = new Date(value)

	if (Number.isNaN(date.getTime())) {
		return value
	}

	return date.toLocaleDateString('vi-VN')
}

export const isValidEmail = (email) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const normalizeStatusCode = (value) => String(value ?? '').trim().toUpperCase()

const getRegisterStatusCode = (card) => {
	const cardType = normalizeStatusCode(card?.card_type || card?.cardType)
	const status = normalizeStatusCode(card?.status)

	if (cardType) {
		return cardType
	}

	if (status === 'ACTIVE' || status === 'INACTIVE') {
		return ''
	}

	return status || 'GUEST'
}

const getIsActive = (card) => {
	if (card?.is_active !== undefined || card?.isActive !== undefined) {
		return Boolean(card.is_active ?? card.isActive)
	}

	const status = normalizeStatusCode(card?.usageStatus || card?.status)

	if (status === 'ACTIVE') {
		return true
	}

	if (status === 'INACTIVE') {
		return false
	}

	return null
}

export const normalizeRfidCard = (card = {}, options = {}) => {
	const registerStatus = getRegisterStatusCode(card)
	const isActive = getIsActive(card)
	const usageStatus = isActive === null ? '' : isActive ? 'ACTIVE' : 'INACTIVE'
	const uid = card.uid || card.cardUid || card.card_uid || ''

	return {
		cardType: registerStatus,
		cardUid: uid,
		email: card.email || card.user?.email || options.fallbackEmail || '',
		id: card.id ?? uid,
		isActive,
		ownerName: card.owner_name || card.ownerName || card.userName || card.user?.name || '',
		plateNumber: card.plate_number || card.plateNumber || '',
		registeredAt: formatDate(card.registered_at || card.registeredAt || card.created_at || card.createdAt),
		registerStatus,
		registerStatusLabel: STATUS_LABELS[registerStatus] || registerStatus,
		status: registerStatus,
		uid,
		usageStatus,
		usageStatusLabel: STATUS_LABELS[usageStatus] || '',
		userId: card.user_id ?? card.userId ?? card.user?.id ?? null,
	}
}

export const filterRfidCards = ({ cards, keyword, status }) => {
	const normalizedKeyword = keyword.trim().toLowerCase()

	return cards.filter((card) => {
		const matchesStatus =
			status === 'ALL' ||
			card.registerStatus === status ||
			card.usageStatus === status
		const searchableText = [card.uid, card.cardUid, card.plateNumber, card.email, card.ownerName]
			.join(' ')
			.toLowerCase()

		return matchesStatus && (!normalizedKeyword || searchableText.includes(normalizedKeyword))
	})
}

export const buildStats = ({ apiStats, cards }) => {
	const registered =
		apiStats?.registeredCards ??
		apiStats?.registered ??
		cards.filter((card) => card.registerStatus === 'REGISTERED').length
	const guest =
		apiStats?.unregisteredCards ??
		apiStats?.guest ??
		apiStats?.unregistered ??
		cards.filter((card) => card.registerStatus === 'GUEST').length
	const active =
		apiStats?.activeCards ??
		apiStats?.active ??
		cards.filter((card) => card.isActive === true).length
	const total = apiStats?.totalCards ?? apiStats?.total ?? cards.length

	return [
		{ icon: 'T', label: 'Tổng số thẻ', tone: 'blue', value: total },
		{ icon: 'ĐK', label: 'Đã đăng ký', tone: 'green', value: registered },
		{ icon: 'CX', label: 'Chưa đăng ký', tone: 'amber', value: guest },
		{ icon: 'ON', label: 'Đang hoạt động', tone: 'cyan', value: active },
	]
}
