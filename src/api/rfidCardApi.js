import axiosClient from './axiosClient'
import instance from '../utils/axiosInterceptor';
const RFID_CARDS_ENDPOINT = '/rfid-cards'

export const getRfidCardStatistics = () => {
	return instance.get(`${RFID_CARDS_ENDPOINT}/statistics`)
}

export const getRfidCards = (params = {}) => {
	return instance.get(RFID_CARDS_ENDPOINT, {
		params,
	})
}

export const getUserIdByEmail = (email) => {
	return instance.get(`${RFID_CARDS_ENDPOINT}/user-email`, {
		params: { email },
	})
}

export const createRfidCard = (payload) => {
	return instance.post(RFID_CARDS_ENDPOINT, payload)
}

export const updateRfidCard = (id, payload) => {
	return instance.patch(`${RFID_CARDS_ENDPOINT}/${id}`, payload)
}

const rfidCardApi = {
	getRfidCardStatistics,
	getRfidCards,
	getUserIdByEmail,
	createRfidCard,
	updateRfidCard,
}

export default rfidCardApi
