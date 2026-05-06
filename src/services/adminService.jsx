import instance from '../utils/axiosInterceptor';

const URL_BACKEND = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`;

export const getUsers = (page = 1, pageSize = 10, search = '') => {
	return instance.get(`${URL_BACKEND}/users`, {
		params: { page, pageSize, search },
	});
};

export const createUser = (payload) => {
	return instance.post(`${URL_BACKEND}/users/admin/create`, payload);
};

export const changeUserRole = (id, new_role) => {
	return instance.patch(`${URL_BACKEND}/users/change-role/${id}`, { new_role });
};

export const getParkingLots = () => {
	return instance.get(`${URL_BACKEND}/parking-lots`);
};

export const getParkingLotById = (lotId) => {
	return instance.get(`${URL_BACKEND}/parking-lots/${lotId}`);
};

export const createParkingLot = (payload) => {
	return instance.post(`${URL_BACKEND}/parking-lots`, payload);
};

export const updateParkingLot = (lotId, payload) => {
	return instance.patch(`${URL_BACKEND}/parking-lots/${lotId}`, payload);
};

export const getParkingLotGates = (lotId) => {
	return instance.get(`${URL_BACKEND}/parking-lots/${lotId}/gates`);
};

export const createGate = (payload) => {
	return instance.post(`${URL_BACKEND}/gates`, payload);
};

export const updateGate = (gateId, payload) => {
	return instance.patch(`${URL_BACKEND}/gates/${gateId}`, payload);
};

export const createParkingSlot = (payload) => {
	return instance.post(`${URL_BACKEND}/parking-slots`, payload);
};

export const getParkingSlotById = (slotId) => {
	return instance.get(`${URL_BACKEND}/parking-slots/${slotId}`);
};

export const updateParkingSlotStatus = (slotId, payload) => {
	return instance.patch(`${URL_BACKEND}/parking-slots/admin/${slotId}`, payload);
};

export const changeParkingSlotDevice = (slotId, payload) => {
	return instance.patch(`${URL_BACKEND}/parking-slots/${slotId}/device`, payload);
};

export const getIoTDevices = (lot_id, status, keyword) => {
	let result = instance.get(`${URL_BACKEND}/iot-devices`, {
		params: {
			lot_id: lot_id ?? undefined,
			status: status || undefined,
			keyword: keyword?.trim() || undefined,
		},
	});
    console.log('getIoTDevices result', result);
    return result;
};

export const createIoTDevice = (payload) => {
	return instance.post(`${URL_BACKEND}/iot-devices`, payload);
};

export const updateIoTDevice = (macAddress, payload) => {
	return instance.patch(`${URL_BACKEND}/iot-devices/${encodeURIComponent(macAddress)}`, payload);
};
