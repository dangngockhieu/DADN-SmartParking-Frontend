import axios from 'axios'
import instance from '../utils/axiosInterceptor';
const URL_BACKEND = `/auth`

/**
 * @template T
 * @typedef {Object} ApiSuccessResponse
 * @property {boolean} success - `true` khi request thành công.
 * @property {string} message - Thông điệp mô tả từ server.
 * @property {T} data - Payload dữ liệu trả về. Có thể là `null` với các thao tác chỉ cập nhật.
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} email - Email đăng ký, chuẩn định dạng email.
 * @property {string} password - Mật khẩu mới, tối thiểu 6 ký tự.
 * @property {string} first_name - Tên (first name) theo chuẩn snake_case của server.
 * @property {string} last_name - Họ (last name) theo chuẩn snake_case của server.
 */

/**
 * @typedef {Object} EmailPayload
 * @property {string} email - Email người dùng đã đăng ký trong hệ thống.
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} email - Email đăng nhập.
 * @property {string} password - Mật khẩu đăng nhập.
 */

/**
 * @typedef {Object} LoginUserResponse
 * @property {number} id - ID người dùng.
 * @property {string} email - Email tài khoản.
 * @property {string} first_name - Tên người dùng.
 * @property {string} last_name - Họ người dùng.
 * @property {string} role - Vai trò: `USER`, `MANAGER`, `ADMIN`.
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} access_token - Access token do server cấp (không xử lý tại client ở bước này).
 * @property {LoginUserResponse} user - Thông tin người dùng đăng nhập.
 */

/**
 * @typedef {Object} ResetPasswordPayload
 * @property {string} email - Email cần đặt lại mật khẩu.
 * @property {string} code - Mã xác thực gửi về email.
 * @property {string} new_password - Mật khẩu mới.
 * @property {string} confirm_password - Xác nhận mật khẩu mới, phải trùng `new_password`.
 */

/**
 * Đăng ký tài khoản mới và gửi email xác thực.
 *
 * @param {RegisterPayload} payload - Thông tin đăng ký theo chuẩn snake_case của server.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn của server với `data = null`.
 */
export const register = (payload) => {
	return axios.post(`${URL_BACKEND}/register`, payload)
}

/**
 * Xác thực email bằng mã code từ link email.
 *
 * @param {string} email - Email cần xác thực.
 * @param {string} code - Mã xác thực gửi qua email.
 * @returns {Promise<import('axios').AxiosResponse<string>>} HTML trang xác thực từ server.
 */
export const verifyEmail = (email, code) => {
	return axios.get(`${URL_BACKEND}/verify`, {
		params: { email, code },
	})
}

/**
 * Gửi lại email xác thực nếu mã cũ hết hạn hoặc người dùng chưa nhận được email.
 *
 * @param {EmailPayload} payload - Payload gồm `email` đã đăng ký.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn của server với `data = null`.
 */
export const resendVerification = (payload) => {
	return axios.post(`${URL_BACKEND}/resend`, payload)
}

/**
 * Đăng nhập bằng email và mật khẩu. Server trả về access token và thông tin user.
 *
 * @param {LoginPayload} payload - Payload đăng nhập gồm `email`, `password`.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<LoginResponse>>>} Response chuẩn với `data.access_token` và `data.user`.
 */
export const login = (payload) => {
	return instance.post(`${URL_BACKEND}/login`, payload, {
		withCredentials: true,
	})
}

/**
 * Đăng xuất tài khoản hiện tại. Server xóa refresh token cookie ở phía server.
 *
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn của server với `data = null`.
 */
export const logout = () => {
	return instance.post(`${URL_BACKEND}/logout`, null, {
		withCredentials: true,
	})
}

/**
 * Làm mới access token từ refresh token cookie. Không xử lý access token ở bước này.
 *
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<LoginResponse>>>} Response chuẩn với `data.access_token` và `data.user`.
 */
export const refreshToken = () => {
	return instance.post(`${URL_BACKEND}/refresh-token`, null, {
		withCredentials: true,
	})
}

/**
 * Gửi email chứa mã hoặc hướng dẫn đặt lại mật khẩu.
 *
 * @param {EmailPayload} payload - Payload gồm `email` cần reset.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn của server với `data = null`.
 */
export const sendResetPassword = (payload) => {
	return instance.post(`${URL_BACKEND}/send-reset-password`, payload)
}

/**
 * Đặt lại mật khẩu bằng mã xác thực gửi về email.
 *
 * @param {ResetPasswordPayload} payload - Payload gồm `email`, `code`, `new_password`, `confirm_password`.
 * @returns {Promise<import('axios').AxiosResponse<ApiSuccessResponse<null>>>} Response chuẩn của server với `data = null`.
 */
export const resetPassword = (payload) => {
	return axios.patch(`${URL_BACKEND}/reset-password`, payload)
}

const authService = {
	register,
	verifyEmail,
	resendVerification,
	login,
	logout,
	refreshToken,
	sendResetPassword,
	resetPassword,
}

export default authService