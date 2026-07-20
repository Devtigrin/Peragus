import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signUp(email, password)

    setLoading(false)

    if (error) {
      setError(error)
    } else {
      setSuccess(true)
      // Se a confirmação de email estiver desativada no Supabase, já redireciona
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Criar conta</h1>

        {error && <p style={styles.error}>{error}</p>}
        {success && (
          <p style={styles.success}>
            Conta criada! Verifique seu email para confirmar (se necessário).
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p style={styles.linkText}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    background: '#fff',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '320px',
  },
  title: { margin: 0, marginBottom: '8px', fontSize: '24px' },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    background: '#3ecf8e',
    color: '#fff',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: { color: '#e74c3c', fontSize: '13px', margin: 0 },
  success: { color: '#27ae60', fontSize: '13px', margin: 0 },
  linkText: { fontSize: '13px', textAlign: 'center' as const, margin: 0 },
}