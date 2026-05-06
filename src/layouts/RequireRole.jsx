import { Navigate, useLocation } from 'react-router-dom';

const getStoredUser = () => {
	try {
		const rawUser = localStorage.getItem('user_info');
		return rawUser ? JSON.parse(rawUser) : null;
	} catch {
		return null;
	}
};

function RequireRole({ allowedRoles = [], children }) {
	const location = useLocation();
	const currentUser = getStoredUser();
	const role = String(currentUser?.role ?? '').toUpperCase();

	if (!currentUser) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}

	if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
		return <Navigate to="/map" replace />;
	}

	return children;
}

export default RequireRole;