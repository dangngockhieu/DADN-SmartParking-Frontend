import axiosClient from './axiosClient'
import instance from '../utils/axiosInterceptor';
const RFID_CARDS_ENDPOINT = '/rfid-cards'

export const getMyRfidCard = () => {
	return instance
		.get(`${RFID_CARDS_ENDPOINT}/my-card`)
		.catch((error) => {
			if (error?.response?.status !== 404) {
				throw error
			}

			return {
				data: {
					success: true,
					message: 'Tài khoản hiện tại chưa có thẻ RFID.',
					data: null,
				},
			}
		})
}

export const getMyRfidCards = () => getMyRfidCard()

export const getMyRfidCardStatistics = () => getMyRfidCard()

const myRfidCardApi = {
	getMyRfidCard,
	getMyRfidCards,
	getMyRfidCardStatistics,
}

export default myRfidCardApi
