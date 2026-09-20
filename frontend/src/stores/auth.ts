import { create } from 'zustand'
import type { User } from '@/types'

const TOKEN_KEY = 'auth-token'
const REFRESH_KEY = 'refresh-token'
const USER_KEY = 'auth-user'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  setSession: (token: string, refreshToken: string | null, user: User) => void
  clearSession: () => void
}

const readUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) as User : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),
  user: readUser(),
  setSession: (token, refreshToken, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, refreshToken, user })
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, refreshToken: null, user: null })
  }
}))
