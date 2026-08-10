import { create } from 'zustand'
import type { AuthState } from '@/types'
import { supabase } from '@/lib/supabase'

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    set({ user: { email: data.user?.email ?? email }, isAuthenticated: true })
    return { error: null }
  },

  register: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) return { error: error.message }
    set({ user: { email: data.user?.email ?? email, name }, isAuthenticated: true })
    return { error: null }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },
}))

supabase.auth.onAuthStateChange((_event, session) => {
  useAuth.setState({
    user: session?.user
      ? { email: session.user.email ?? '', name: (session.user.user_metadata?.full_name as string | undefined) ?? undefined }
      : null,
    isAuthenticated: !!session,
    loading: false,
  })
})
