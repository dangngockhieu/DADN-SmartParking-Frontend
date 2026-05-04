import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthLanding from './pages/auth/AuthLanding'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ResetVerify from './pages/auth/ResetVerify'
import Map from './pages/Map'
import ChangePassword from './pages/ChangePassword'
import ErrorPage from './pages/Error'
import AuthLayout from './layouts/AuthLayouts'
import MainLayout from './layouts/MainLayouts'

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
    element: <MainLayout />, // Layout chính cho các trang khác, cần đăng nhập xong thì mới vào được
    children: [
      { path: '/map', element: <Map /> },
      { path: '/change-password', element: <ChangePassword /> },
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
