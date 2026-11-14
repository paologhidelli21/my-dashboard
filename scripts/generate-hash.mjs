import { createHash } from 'node:crypto'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npm run generate:hash -- "la-tua-password"')
  process.exit(1)
}

console.log(createHash('sha256').update(password, 'utf8').digest('hex'))
