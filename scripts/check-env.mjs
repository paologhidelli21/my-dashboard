import { existsSync } from 'node:fs'
import process from 'node:process'

if (!existsSync('.env')) {
  console.error('File .env NON trovato nella cartella corrente.')
  console.error('Assicurati di lanciare questo comando dalla root del progetto e di aver fatto "cp .env.example .env".')
  process.exit(1)
}

try {
  process.loadEnvFile()
} catch (error) {
  console.error('Impossibile leggere il file .env:', error instanceof Error ? error.message : error)
  process.exit(1)
}

const raw = process.env.DASHBOARD_PASSWORD_HASH

if (!raw) {
  console.error('DASHBOARD_PASSWORD_HASH assente dentro .env (o vuota).')
  console.error('Attenzione: se la variabile è già impostata nel terminale con valore vuoto, il .env non può sovrascriverla.')
  process.exit(1)
}

const value = raw.trim()
const parts = value.split(':')
const saltOk = /^[0-9a-f]{16,}$/.test(parts[1] ?? '')
const hashOk = /^[0-9a-f]{64,}$/.test(parts[2] ?? '')

console.log('DASHBOARD_PASSWORD_HASH trovata in .env. Diagnostica:')
console.log(`  primo blocco uguale a "scrypt": ${parts[0] === 'scrypt' ? 'sì ✔' : `no ✗ (trovato: "${parts[0]}")`}`)
console.log(`  numero di blocchi separati da ":": ${parts.length} (attesi: 3)`)
console.log(`  lunghezza salt: ${parts[1]?.length ?? 0} caratteri (attesi: 32)`)
console.log(`  lunghezza hash: ${parts[2]?.length ?? 0} caratteri (attesi: 128)`)
console.log(`  salt esadecimale valido: ${saltOk ? 'sì ✔' : 'no ✗'}`)
console.log(`  hash esadecimale valido: ${hashOk ? 'sì ✔' : 'no ✗'}`)

if (parts[0] === 'scrypt' && parts.length === 3 && saltOk && hashOk) {
  console.log('\nFormato valido ✔ — l\'hash è pronto. Avvia il server con "npm run dev".')
  process.exit(0)
}

console.log('\nFormato NON valido ✗ — rigenera l\'hash e incolla l\'INTERA riga di output:')
console.log('  npm run generate:hash -- "la-tua-password"')
console.log('L\'output inizia con "scrypt:" e contiene due punti: copialo tutto, per intero.')
process.exit(1)
