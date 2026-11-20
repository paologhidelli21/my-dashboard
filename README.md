# my-dashboard

Dashboard personale che gira nel browser, con accesso protetto da password.
Realizzata con **React + Vite + TypeScript** e un backend Node.js (Express).

## Setup

```bash
npm install
cp .env.example .env
```

Genera l'hash della tua password e incollalo in `.env`:

```bash
npm run generate:hash -- "la-tua-password"
```

Incolla nel `.env` **l'intera riga di output** (inizia con `scrypt:` e contiene due
punti). Puoi verificare che il formato sia corretto con:

```bash
npm run check:env
```

Poi avvia l'ambiente di sviluppo (server API + frontend insieme):

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Server API: http://localhost:8787 (il frontend inoltra `/api/*` via proxy)

## Produzione

```bash
npm run build
npm run start
```

Il server serve la build da `dist/` e le API sulla porta `8787` (configurabile
con `PORT`).

## Script disponibili

| Comando             | Descrizione                                        |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Server API + frontend con hot reload               |
| `npm run build`     | Type-check + build di produzione in `dist/`        |
| `npm run start`     | Server di produzione (API + file statici)          |
| `npm run generate:hash` | Genera l'hash scrypt della password            |

## Come funziona l'autenticazione

- La password non è mai scritta nel codice né inviata in chiaro al client: nel
  file `.env` viene salvato solo un hash **scrypt con salt casuale**
  (`DASHBOARD_PASSWORD_HASH`, formato `scrypt:salt:hash`).
- La verifica avviene **solo lato server** (`POST /api/login`) con confronto a
  tempo costante (`timingSafeEqual`): l'hash non è presente nel JavaScript
  distribuito al browser.
- La sessione è un token casuale a 256 bit salvato in un **cookie `HttpOnly`**
  con `SameSite=Strict` (inaccessibile a JavaScript e protetto contro CSRF).
  Durata 7 giorni; termina con "Esci" o al riavvio del server.
- **Rate limiting**: dopo 5 tentativi falliti, l'IP viene bloccato per 15 minuti.
- Le route API riservate usano il middleware `requireAuth`
  (vedi `GET /api/protected` come esempio).

## Nota sulla sicurezza

- L'autenticazione è ora lato server: le route API protette sono realmente
  inaccessibili senza una sessione valida.
- I file statici (codice JavaScript della SPA) restano pubblici: è il normale
  funzionamento di un'app client-side; i dati sensibili devono stare dietro
  route API protette.
- Note e link rapidi sono salvati in `localStorage` del browser: restano sul
  dispositivo dell'utente.
- In produzione servi la dashboard via **HTTPS** (il cookie `Secure` è attivo di
  default quando `NODE_ENV=production`; vedi `COOKIE_SECURE` in `.env.example`).
- Le sessioni sono tenute in memoria: riavviando il server tutti gli accessi
  vengono revocati (comportamento voluto per un uso personale).
