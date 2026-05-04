import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from '../../utils/axiosCustomize'

export type UserAccount = {
  id?: number
  email?: string
  first_name?: string
  last_name?: string
  role?: string
}

type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

type AuthPayload = {
  access_token?: string
  user?: UserAccount
}

export type UserState = {
  account: UserAccount | null
  access_token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const initialState: UserState = {
  account: null,
  access_token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = (await axios.post('/api/v1/auth/login', credentials)) as ApiResponse<AuthPayload>
      if (!response || !response.success) {
        return rejectWithValue(response?.message || 'Login failed')
      }
      return response
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: { email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const response = (await axios.post('/api/v1/auth/register', userData)) as ApiResponse<AuthPayload>
      if (!response || !response.success) {
        return rejectWithValue(response?.message || 'Registration failed')
      }
      return response
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed'
      return rejectWithValue(message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/api/v1/auth/logout')
      return null
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Logout failed'
      return rejectWithValue(message)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<UserAccount | null>) => {
      state.account = action.payload
      state.isAuthenticated = !!action.payload && !!state.access_token
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.access_token = action.payload
      state.isAuthenticated = !!state.account && !!state.access_token
    },
    doLogout: (state) => {
      state.account = null
      state.access_token = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const payload = action.payload as ApiResponse<AuthPayload>
        state.isLoading = false
        state.account = payload?.data?.user ?? null
        state.access_token = payload?.data?.access_token ?? null
        state.isAuthenticated = !!state.access_token
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const payload = action.payload as ApiResponse<AuthPayload>
        state.isLoading = false
        state.account = payload?.data?.user ?? null
        state.access_token = payload?.data?.access_token ?? null
        state.isAuthenticated = !!state.access_token
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.account = null
        state.access_token = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Still logout on error
        state.account = null
        state.access_token = null
        state.isAuthenticated = false
      })
  },
})

export const { setAccount, updateAccessToken, doLogout, clearError } = userSlice.actions
export default userSlice.reducer
