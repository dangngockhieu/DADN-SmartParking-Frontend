import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'
import userReducer from './slices/userSlice'

const createWebStorageImpl =
  typeof createWebStorage === 'function'
    ? createWebStorage
    : (createWebStorage as { default: typeof createWebStorage }).default

const storage =
  typeof window !== 'undefined'
    ? createWebStorageImpl('local')
    : {
        getItem: async (key: string) => {
          void key
          return null
        },
        setItem: async (key: string, value: string) => {
          void key
          return value
        },
        removeItem: async (key: string) => {
          void key
        },
      }

// Persist config for user slice
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['account', 'isAuthenticated'], // Only persist these fields
}

const persistedUserReducer = persistReducer(userPersistConfig, userReducer)

export const store = configureStore({
  reducer: {
    user: persistedUserReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch