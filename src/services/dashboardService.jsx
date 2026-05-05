import axiosInstance from '../utils/axiosInterceptor'

export const getParkingFlow = ({ date, lotId } = {}) => {
	const params = {
		date,
		...(lotId ? { lotId } : {}),
	}

	return axiosInstance.get('/dashboard/parking-flow', { params })
}

const dashboardService = {
	getParkingFlow,
}

export default dashboardService
