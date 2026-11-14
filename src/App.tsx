import { useEffect, useState } from 'react'
import { checkSession, logout } from './auth'
import { Login } from './Login'
import { Dashboard } from './Dashboard'

type AuthState = 'checking' | 'out' | 'in'

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('checking')

  useEffect(() => {
    let cancelled = false
    checkSession().then((authenticated) => {
      if (!cancelled) setAuthState(authenticated ? 'in' : 'out')
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    await logout()
    setAuthState('out')
  }

  if (authState === 'checking') {
    return (
      <main className="login-screen">
        <p className="subtitle">Caricamento…</p>
      </main>
    )
  }

  return authState === 'in' ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onSuccess={() => setAuthState('in')} />
  )
}
