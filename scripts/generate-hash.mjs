import { randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)

const password = process.argv[2]

if (!password) {
  console.error('Usage: npm run generate:hash -- "la-tua-password"')
  process.exit(1)
}

const salt = randomBytes(16)
const derived = await scrypt(password, salt, 64)

console.log(`scrypt:${salt.toString('hex')}:${derived.toString('hex')}`)
