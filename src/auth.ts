const SESSION_KEY = 'my-dashboard-session'

const PASSWORD_HASH = import.meta.env.VITE_DASHBOARD_PASSWORD_HASH as string | undefined

export function isAuthConfigured(): boolean {
  return Boolean(PASSWORD_HASH)
}

export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function login(password: string): Promise<boolean> {
  if (!PASSWORD_HASH) return false
  const hash = await hashPassword(password)
  if (hash !== PASSWORD_HASH) return false
  sessionStorage.setItem(SESSION_KEY, hash)
  return true
}

export function isLoggedIn(): boolean {
  return Boolean(PASSWORD_HASH) && sessionStorage.getItem(SESSION_KEY) === PASSWORD_HASH
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
