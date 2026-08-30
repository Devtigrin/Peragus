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
  verifyRecoveryOtp: (tokenHash: string) => ReturnType<typeof supabase.auth.verifyOtp>
  signOut: () => Promise<void>
  recovering: boolean
  clearRecovery: () => void
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
      })
      .catch((err) => {
        // Falha ao restaurar a sessão (ex.: storage/erro de rede). Não deixamos
        // o usuario preso em loading: seguimos como deslogado.
        if (typeof console !== 'undefined') console.error('[peragus:auth] getSession failed:', err?.message)
        if (!active) return
        setSession(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      if (event === 'SIGNED_OUT') setRecovering(false)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    sendReset: (email, options) => supabase.auth.resetPasswordForEmail(email, options),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    verifyRecoveryOtp: (tokenHash) => supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }),
    signOut: async () => {
    await supabase.auth.signOut()
  },
    recovering,
    clearRecovery: () => setRecovering(false),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
