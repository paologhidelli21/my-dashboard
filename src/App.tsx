import { useState } from 'react'
import { isLoggedIn } from './auth'
import { Login } from './Login'
import { Dashboard } from './Dashboard'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)

  return loggedIn ? (
    <Dashboard onLogout={() => setLoggedIn(false)} />
  ) : (
    <Login onSuccess={() => setLoggedIn(true)} />
  )
}
