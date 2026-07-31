import { create } from 'zustand'
import type { AuthState } from '@/types'

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email: string, password: string) => {
    void password
    set({ user: { email }, isAuthenticated: true })
  },
  register: (email: string, password: string, name: string) => {
    void password
    set({ user: { email, name }, isAuthenticated: true })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
}))
