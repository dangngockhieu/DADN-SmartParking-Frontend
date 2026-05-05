import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import AuthLanding from './pages/auth/AuthLanding'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ResetVerify from './pages/auth/ResetVerify'
import Map from './pages/Map'
import ChangePassword from './pages/ChangePassword'
import MyRfidCardStatusPage from './pages/MyRfidCardStatusPage'
import DashboardPage from './pages/admin/DashboardPage'
import RfidCardManagementPage from './pages/admin/RfidCardManagementPage'
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
      { path: '/change-password', element: <ChangePassword /> },
      { path: '/my-cards', element: <MyRfidCardStatusPage /> },
      { path: '/my-card', element: <Navigate to="/my-cards" replace /> },
      { path: '/my-rfid-card', element: <Navigate to="/my-cards" replace /> },
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
