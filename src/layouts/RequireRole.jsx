import { Navigate, useLocation } from 'react-router-dom'

function getStoredRole() {
	try {
		const rawUser = localStorage.getItem('user_info')
		const user = rawUser ? JSON.parse(rawUser) : null
		return String(user?.role ?? '').toUpperCase()
	} catch {
		return ''
	}
}

function RequireRole({ allowedRoles, children }) {
	const location = useLocation()
	const role = getStoredRole()

	if (!allowedRoles.includes(role)) {
		return <Navigate to="/map" state={{ from: location }} replace />
	}

	return children
}

export default RequireRole
