import { Outlet } from 'react-router-dom'

function MainLayout() {
	return (
		<div className="main-layout">
			<div className="main-layout__frame">
			<Outlet />
			</div>
		</div>
	)
}

export default MainLayout