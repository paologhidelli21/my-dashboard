import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'

try {
  process.loadEnvFile()
} catch {
  // .env assente o non leggibile: si procede con le variabili d'ambiente esistenti
}
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSession,
  destroySession,
  isValidSession,
  verifyPassword,
  verifyPasswordFormat,
} from './auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

const PORT = Number(process.env.PORT ?? 8787)
const PASSWORD_HASH = process.env.DASHBOARD_PASSWORD_HASH?.trim()
const COOKIE_SECURE = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE !== '0'
  : process.env.NODE_ENV === 'production'

const MAX_ATTEMPTS = 5
const BLOCK_MS = 15 * 60 * 1000
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000

const failedAttempts = new Map<string, { count: number; firstAttempt: number; blockedUntil: number }>()

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))

function getSessionToken(req: Request): string | undefined {
  const header = req.headers.cookie
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

function sessionCookie(token: string, maxAge: number): string {
  const attrs = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ]
  if (COOKIE_SECURE) attrs.push('Secure')
  return attrs.join('; ')
}

function blockedForMs(ip: string): number {
  const record = failedAttempts.get(ip)
  if (!record) return 0
  return Math.max(0, record.blockedUntil - Date.now())
}

function registerFailure(ip: string): void {
  const now = Date.now()
  const record = failedAttempts.get(ip)
  if (!record || now - record.firstAttempt > ATTEMPT_WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAttempt: now, blockedUntil: 0 })
    return
  }
  record.count += 1
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS
    record.count = 0
    record.firstAttempt = now
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isValidSession(getSessionToken(req))) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  next()
}

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const ip = req.ip ?? 'unknown'
    if (blockedForMs(ip) > 0) {
      res.status(429).json({ error: 'rate_limited' })
      return
    }

    const password = req.body?.password
    if (typeof password !== 'string' || password.length === 0 || password.length > 1024) {
      res.status(400).json({ error: 'bad_request' })
      return
    }

    if (!PASSWORD_HASH || !verifyPasswordFormat(PASSWORD_HASH)) {
      res.status(503).json({ error: 'not_configured' })
      return
    }

    const ok = await verifyPassword(password, PASSWORD_HASH)
    if (!ok) {
      registerFailure(ip)
      res.status(401).json({ error: 'invalid_password' })
      return
    }

    failedAttempts.delete(ip)
    const token = createSession()
    res.setHeader('Set-Cookie', sessionCookie(token, SESSION_TTL_SECONDS))
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/logout', (req: Request, res: Response) => {
  destroySession(getSessionToken(req))
  res.setHeader('Set-Cookie', sessionCookie('', 0))
  res.json({ ok: true })
})

app.get('/api/session', (req: Request, res: Response) => {
  res.json({ authenticated: isValidSession(getSessionToken(req)) })
})

app.get('/api/protected', requireAuth, (_req: Request, res: Response) => {
  res.json({ message: 'Dati riservati accessibili solo con sessione valida' })
})

app.use(express.static(distDir))

app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`my-dashboard server in ascolto su http://localhost:${PORT}`)
  if (!PASSWORD_HASH || !verifyPasswordFormat(PASSWORD_HASH)) {
    console.warn(
      'DASHBOARD_PASSWORD_HASH non configurato: il login è disabilitato. ' +
        'Genera l\'hash con "npm run generate:hash -- \\"la-tua-password\\"" e inseriscilo nel file .env',
    )
  }
})
