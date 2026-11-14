import { useState } from 'react'
import type { FormEvent } from 'react'
import { isAuthConfigured, login } from './auth'

interface LoginProps {
  onSuccess: () => void
}

export function Login({ onSuccess }: LoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const configured = isAuthConfigured()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!password || loading) return
    setLoading(true)
    setError(null)
    try {
      const ok = await login(password)
      if (ok) {
        onSuccess()
      } else {
        setError('Password non corretta.')
      }
    } catch {
      setError('Errore durante la verifica. Riprova.')
    } finally {
      setLoading(false)
      setPassword('')
    }
  }

  return (
    <main className="login-screen">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>My Dashboard</h1>
        <p className="subtitle">Area personale — accesso riservato</p>
        {configured ? (
          <>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Inserisci la password"
              autoFocus
              autoComplete="current-password"
            />
            {error && <p className="error" role="alert">{error}</p>}
            <button type="submit" disabled={loading || !password}>
              {loading ? 'Verifica…' : 'Entra'}
            </button>
          </>
        ) : (
          <p className="error" role="alert">
            Password non configurata. Copia <code>.env.example</code> in <code>.env</code> e imposta{' '}
            <code>VITE_DASHBOARD_PASSWORD_HASH</code> (generalo con{' '}
            <code>npm run generate:hash -- "la-tua-password"</code>).
          </p>
        )}
      </form>
    </main>
  )
}
