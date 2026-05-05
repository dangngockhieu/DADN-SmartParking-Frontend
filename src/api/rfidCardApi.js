import axiosClient from './axiosClient'

const RFID_CARDS_ENDPOINT = '/rfid-cards'

export const getRfidCardStatistics = () => {
	return axiosClient.get(`${RFID_CARDS_ENDPOINT}/statistics`)
}

export const getRfidCards = (params = {}) => {
	return axiosClient.get(RFID_CARDS_ENDPOINT, {
		params,
	})
}

export const getUserIdByEmail = (email) => {
	return axiosClient.get(`${RFID_CARDS_ENDPOINT}/user-email`, {
		params: { email },
	})
}

export const createRfidCard = (payload) => {
	return axiosClient.post(RFID_CARDS_ENDPOINT, payload)
}

export const updateRfidCard = (id, payload) => {
	return axiosClient.patch(`${RFID_CARDS_ENDPOINT}/${id}`, payload)
}

const rfidCardApi = {
	getRfidCardStatistics,
	getRfidCards,
	getUserIdByEmail,
	createRfidCard,
	updateRfidCard,
}

export default rfidCardApi
