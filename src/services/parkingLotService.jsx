import axiosInstance from '../utils/axiosInterceptor'

export const getParkingLots = () => {
	return axiosInstance.get('/parking-lots')
}

const parkingLotService = {
	getParkingLots,
}

export default parkingLotService
