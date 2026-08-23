import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>
  signUp: (email: string, password: string) => ReturnType<typeof supabase.auth.signUp>
  sendReset: (
    email: string,
    options?: { redirectTo?: string },
  ) => ReturnType<typeof supabase.auth.resetPasswordForEmail>
  updatePassword: (password: string) => ReturnType<typeof supabase.auth.updateUser>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    sendReset: (email, options) => supabase.auth.resetPasswordForEmail(email, options),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    signOut: async () => {
    await supabase.auth.signOut()
  },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
