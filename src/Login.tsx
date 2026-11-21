import { useState } from 'react'
import type { FormEvent } from 'react'
import { login } from './auth'
import type { LoginError } from './auth'

const ERROR_MESSAGES: Record<LoginError, string> = {
  invalid_password: 'Password non corretta.',
  rate_limited: 'Troppi tentativi. Riprova tra qualche minuto.',
  not_configured:
    'Password non configurata sul server. Imposta DASHBOARD_PASSWORD_HASH nel file .env (genera l\'hash con npm run generate:hash -- "la-tua-password").',
  bad_request: 'Richiesta non valida.',
  server_error: 'Errore del server. Riprova.',
  network: 'Errore di rete. Riprova.',
}

interface LoginProps {
  onSuccess: () => void
}

export function Login({ onSuccess }: LoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!password || loading) return
    setLoading(true)
    setError(null)
    const result = await login(password)
    setLoading(false)
    setPassword('')
    if (result.ok) {
      onSuccess()
    } else {
      setError(ERROR_MESSAGES[result.error ?? 'network'])
    }
  }

  return (
    <main className="login-screen">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>My Dashboard</h1>
        <p className="subtitle">Area personale — accesso riservato</p>
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
      </form>
    </main>
  )
}
