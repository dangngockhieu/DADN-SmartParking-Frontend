import { Outlet } from 'react-router-dom'

function AuthLayout() {
	return (
		<div className="auth-layout">
			<div className="auth-layout__frame">
			<Outlet />
			</div>
		</div>
	)
}

export default AuthLayout