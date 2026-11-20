import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>

export const SESSION_COOKIE = 'dashboard_session'
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

const sessions = new Map<string, number>()

export function verifyPasswordFormat(hash: string | undefined): boolean {
  if (!hash) return false
  const parts = hash.split(':')
  return (
    parts.length === 3 &&
    parts[0] === 'scrypt' &&
    /^[0-9a-f]{16,}$/.test(parts[1]) &&
    /^[0-9a-f]{64,}$/.test(parts[2])
  )
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, saltHex, hashHex] = stored.split(':')
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const derived = await scrypt(password, salt, expected.length)
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

export function createSession(): string {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, Date.now() + SESSION_TTL_SECONDS * 1000)
  return token
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false
  const expiresAt = sessions.get(token)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    sessions.delete(token)
    return false
  }
  return true
}

export function destroySession(token: string | undefined): void {
  if (token) sessions.delete(token)
}
