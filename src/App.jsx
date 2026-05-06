import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthLanding from './pages/auth/AuthLanding'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ResetVerify from './pages/auth/ResetVerify'
import Map from './pages/Map'
import ParkingSession from './pages/ParkingSession'
import ChangePassword from './pages/ChangePassword'
import MyRfidCardStatusPage from './pages/MyRfidCardStatusPage'
import { Navigate } from 'react-router-dom'
import DashboardPage from './pages/admin/DashboardPage'
import RfidCardManagementPage from './pages/admin/RfidCardManagementPage'
import ManageUsers from './pages/admin/ManageUsers'
import ManageParkingLots from './pages/admin/ManageParkingLots'
import ManageDevices from './pages/admin/ManageDevices'
import ErrorPage from './pages/Error'
import AuthLayout from './layouts/AuthLayouts'
import MainLayout from './layouts/MainLayouts'
import RequireAuth from './layouts/RequireAuth'
import RequireRole from './layouts/RequireRole'

const router = createBrowserRouter([
  {
    element: <AuthLayout />, // Layout cha bao bọc
    children: [
      { path: '/', element: <AuthLanding /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/reset-verify', element: <ResetVerify /> },
    ]
  },
  {
    element: <RequireAuth><MainLayout /></RequireAuth>, // Protected layout
    children: [
      { path: '/map', element: <Map /> },
      { path: '/parking-session', element: <ParkingSession /> },
      { path: '/change-password', element: <ChangePassword /> },
      { path: '/my-cards', element: <MyRfidCardStatusPage /> },
      { path: '/my-card', element: <Navigate to="/my-cards" replace /> },
      { path: '/my-rfid-card', element: <Navigate to="/my-cards" replace /> },
      {
        path: '/manage-users',
        element: (
          <RequireRole allowedRoles={['ADMIN']}>
            <ManageUsers />
          </RequireRole>
        ),
      },
      {
        path: '/manage-parking-lots',
        element: (
          <RequireRole allowedRoles={['ADMIN']}>
            <ManageParkingLots />
          </RequireRole>
        ),
      },
      {
        path: '/manage-iot-devices',
        element: (
          <RequireRole allowedRoles={['ADMIN']}>
            <ManageDevices />
          </RequireRole>
        ),
      },
      {
        path: '/admin/dashboard',
        element: (
          <RequireRole allowedRoles={['ADMIN', 'MANAGER']}>
            <DashboardPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/rfid-cards',
        element: (
          <RequireRole allowedRoles={['ADMIN']}>
            <RfidCardManagementPage />
          </RequireRole>
        ),
      },
    ]
  },
  {
    path: '/error',
    element: <ErrorPage />,
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
