import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken } from '../utils/axiosInterceptor'

/**
 * Guard component that redirects to AuthLanding when no access token is present.
 * It reads the in-memory token from the axios interceptor or falls back to
 * `localStorage` if the app persists the token there.
 */
export default function RequireAuth({ children }) {
  const token = getAccessToken() || localStorage.getItem('access_token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}
