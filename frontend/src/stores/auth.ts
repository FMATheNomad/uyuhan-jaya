import { create } from 'zustand'
import api from '@/services/api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  contractor: 'Kontraktor',
  mandor: 'Mandor',
}

export const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  contractor: 'bg-blue-100 text-blue-700',
  mandor: 'bg-green-100 text-green-700',
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, isAuthenticated: true })
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },
}))
