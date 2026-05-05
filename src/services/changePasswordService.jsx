import instance from '../utils/axiosInterceptor';
const URL_BACKEND = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1/users`

/**
 * @template T
 * @typedef {Object} ApiSuccessResponse
 * @property {boolean} success - `true` khi server xử lý thành công.
 * @property {string} message - Thông điệp mô tả kết quả.
 * @property {T} data - Dữ liệu trả về, thường là `null` cho hành động cập nhật.
 */

/**
 * @typedef {Object} ChangePasswordPayload
 * @property {string} old_password - Mật khẩu cũ hiện tại.
 * @property {string} new_password - Mật khẩu mới (6-30 ký tự).
 * @property {string} confirm_password - Xác nhận mật khẩu mới, phải trùng `new_password`.
 */

/**
 * Người dùng đang đăng nhập đổi mật khẩu của chính mình.
 *
 * @param {ChangePasswordPayload} payload - Payload đổi mật khẩu theo chuẩn snake_case.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn của server với `data = null`.
 */
export const changePassword = (payload) => {
	return instance.patch(`${URL_BACKEND}/change-password`, payload)
}

const changePasswordService = {
	changePassword,
}

export default changePasswordService