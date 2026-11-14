# my-dashboard

Dashboard personale che gira nel browser, con accesso protetto da password.
Realizzata con **React + Vite + TypeScript**.

## Setup

```bash
npm install
cp .env.example .env
```

Genera l'hash della tua password e incollalo in `.env`:

```bash
npm run generate:hash -- "la-tua-password"
```

Poi avvia l'ambiente di sviluppo:

```bash
npm run dev
```

## Script disponibili

| Comando             | Descrizione                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Server di sviluppo con hot reload            |
| `npm run build`     | Type-check + build di produzione in `dist/`  |
| `npm run preview`   | Anteprima locale della build di produzione   |
| `npm run generate:hash` | Genera l'hash SHA-256 della password     |

## Come funziona l'accesso

- La password non è mai scritta nel codice: nel file `.env` viene salvato solo
  il suo hash SHA-256 (`VITE_DASHBOARD_PASSWORD_HASH`).
- Al login la password inserita viene hashed con la Web Crypto API e confrontata
  con l'hash configurato; la sessione vive in `sessionStorage` e termina alla
  chiusura della scheda o con il pulsante "Esci".
- Note e link rapidi sono salvati in `localStorage` del browser.

## Nota sulla sicurezza

L'autenticazione è lato client: protegge la privacy della dashboard rispetto a
occhi occasionali, ma non è un confine di sicurezza crittografico (il codice e
l'hash sono visibili in un'app statica). Se in futuro salvi dati realmente
sensibili, aggiungi un backend con autenticazione server-side.
