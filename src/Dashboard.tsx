import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { logout } from './auth'

const NOTES_KEY = 'my-dashboard-notes'
const LINKS_KEY = 'my-dashboard-links'

interface DashboardProps {
  onLogout: () => void
}

interface LinkItem {
  label: string
  url: string
}

const DEFAULT_LINKS: LinkItem[] = [
  { label: 'Gmail', url: 'https://mail.google.com' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Calendar', url: 'https://calendar.google.com' },
]

function loadLinks(): LinkItem[] {
  const raw = localStorage.getItem(LINKS_KEY)
  if (!raw) return DEFAULT_LINKS
  try {
    const parsed = JSON.parse(raw) as LinkItem[]
    return Array.isArray(parsed) ? parsed : DEFAULT_LINKS
  } catch {
    return DEFAULT_LINKS
  }
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [now, setNow] = useState(() => new Date())
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_KEY) ?? '')
  const [links, setLinks] = useState<LinkItem[]>(loadLinks)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, notes)
  }, [notes])

  useEffect(() => {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links))
  }, [links])

  const dateLabel = now.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeLabel = now.toLocaleTimeString('it-IT')

  function handleLogout() {
    logout()
    onLogout()
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div>
          <h1>My Dashboard</h1>
          <p className="date">{dateLabel}</p>
        </div>
        <div className="topbar-right">
          <span className="clock">{timeLabel}</span>
          <button onClick={handleLogout}>Esci</button>
        </div>
      </header>

      <section className="grid">
        <article className="card">
          <h2>Benvenuto</h2>
          <p>Questo è il tuo spazio personale. Modifica i widget qui sotto per iniziare.</p>
        </article>

        <article className="card">
          <h2>Link rapidi</h2>
          <ul className="links">
            {links.map((link, index) => (
              <li key={`${link.url}-${index}`}>
                <a href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
                <button
                  className="link-remove"
                  aria-label={`Rimuovi ${link.label}`}
                  onClick={() => setLinks(links.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <AddLink onAdd={(link) => setLinks([...links, link])} />
        </article>

        <article className="card notes">
          <h2>Note</h2>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Scrivi qui le tue note (salvate nel browser)…"
            rows={8}
          />
        </article>
      </section>
    </div>
  )
}

function AddLink({ onAdd }: { onAdd: (link: LinkItem) => void }) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!label.trim() || !url.trim()) return
    onAdd({ label: label.trim(), url: url.trim() })
    setLabel('')
    setUrl('')
  }

  return (
    <form className="add-link" onSubmit={handleSubmit}>
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Nome"
        aria-label="Nome del link"
      />
      <input
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://…"
        aria-label="URL del link"
        type="url"
      />
      <button type="submit" disabled={!label.trim() || !url.trim()}>Aggiungi</button>
    </form>
  )
}
