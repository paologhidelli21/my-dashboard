export type LoginError =
  | 'invalid_password'
  | 'rate_limited'
  | 'not_configured'
  | 'bad_request'
  | 'server_error'
  | 'network'

export interface LoginResult {
  ok: boolean
  error?: LoginError
}

export async function login(password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) return { ok: true }
    const body = (await res.json().catch(() => ({}))) as { error?: LoginError }
    return { ok: false, error: body.error ?? 'network' }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function checkSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/session')
    if (!res.ok) return false
    const body = (await res.json()) as { authenticated?: boolean }
    return Boolean(body.authenticated)
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/logout', { method: 'POST' }).catch(() => undefined)
}
