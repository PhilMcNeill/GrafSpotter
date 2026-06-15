'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { EntryFilters, GraffitiType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { AuthModal } from '@/components/auth/AuthModal'
import type { User } from '@supabase/supabase-js'

interface Props {
  filters: EntryFilters
  onChange: (filters: EntryFilters) => void
  entryCount: number
}

// Type grid: 2 columns, 3 rows — matches Figma layout
const TYPE_GRID: [GraffitiType, GraffitiType][] = [
  ['tag', 'throw-up'],
  ['sticker', 'stencil'],
  ['piece', 'mural'],
]

// Scale: designed at 3840×2160. Target ~1440px wide.
// Sidebar = 800/3840 = 20.8% → use 20vw clamped
// All internal px values ÷ 2.67 (3840→1440 ratio)

export function FilterPanel({ filters, onChange, entryCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [writers, setWriters] = useState<string[]>([])
  const [writerInput, setWriterInput] = useState(filters.writer ?? '')
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    fetch('/api/writers').then(r => r.json()).then(d => setWriters(d.writers ?? [])).catch(() => {})
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setShowAuth(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  function update(patch: Partial<EntryFilters>) {
    onChange({ ...filters, ...patch })
  }

  function toggleType(type: GraffitiType) {
    update({ type: filters.type === type ? undefined : type })
  }

  async function handleLogout() {
    await createClient().auth.signOut()
    router.refresh()
  }

  const hasFilters = !!(filters.writer || filters.type || filters.date_from || filters.date_to)

  // Shared text style: IBM Plex Mono, #dfdfdf, uppercase, tracked
  const sectionLabel = 'text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase'
  const cellBase = 'flex items-center justify-center text-[clamp(8px,0.72vw,11px)] tracking-[0.28em] uppercase transition-colors cursor-pointer py-[clamp(12px,1.32vh,21px)]'

  return (
    <div className="h-full flex flex-col bg-[#141415] select-none overflow-hidden">

      {/* ── FILTER header ── */}
      <div className="flex items-center justify-between px-[clamp(16px,2.1vw,30px)] pt-[clamp(24px,3.5vh,52px)] pb-0">
        <span className={sectionLabel}>FILTER</span>
        {hasFilters && (
          <button
            onClick={() => { onChange({}); setWriterInput('') }}
            className="text-[clamp(8px,0.65vw,10px)] tracking-[0.28em] uppercase text-[#444] hover:text-[#dfdfdf] transition-colors"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* ── Scrollable filter body ── */}
      <div className="flex-1 overflow-y-auto px-[clamp(16px,2.1vw,30px)] space-y-[clamp(20px,3.5vh,52px)] pt-[clamp(20px,3.7vh,56px)]">

        {/* WRITER */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>WRITER</p>
          <input
            list="writers-list"
            value={writerInput}
            onChange={e => { setWriterInput(e.target.value); update({ writer: e.target.value || undefined }) }}
            placeholder="ANY"
            className="w-full bg-[#424242] border-0 px-[clamp(10px,1.1vw,16px)] py-[clamp(12px,1.68vh,24px)] text-[clamp(9px,0.78vw,12px)] tracking-[0.28em] uppercase text-[#dfdfdf] placeholder-[#dfdfdf] focus:outline-none focus:ring-1 focus:ring-[#666] transition-colors"
          />
          <datalist id="writers-list">
            {writers.map(w => <option key={w} value={w} />)}
          </datalist>
        </div>

        {/* TYPE */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>TYPE</p>
          <div className="grid grid-cols-2 gap-px bg-[#0a0a0a]">
            {TYPE_GRID.flat().map(t => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`${cellBase} ${filters.type === t ? 'bg-[#424242] text-[#dfdfdf]' : 'bg-[#2a2b2b] text-[#dfdfdf] hover:bg-[#333]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* DATE RANGE */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>DATE RANGE</p>
          <div className="space-y-px">
            <div className="relative">
              <span className="absolute left-[clamp(10px,1.1vw,16px)] top-1/2 -translate-y-1/2 text-[clamp(9px,0.78vw,12px)] tracking-[0.2em] uppercase text-[#dfdfdf] pointer-events-none">FROM:</span>
              <input
                type="date"
                value={filters.date_from ?? ''}
                onChange={e => update({ date_from: e.target.value || undefined })}
                className="w-full bg-[#424242] border-0 pl-[clamp(52px,5vw,72px)] pr-[clamp(10px,1.1vw,16px)] py-[clamp(12px,1.68vh,24px)] text-[clamp(9px,0.78vw,12px)] tracking-[0.15em] text-[#dfdfdf] focus:outline-none [color-scheme:dark]"
              />
            </div>
            <div className="relative">
              <span className="absolute left-[clamp(10px,1.1vw,16px)] top-1/2 -translate-y-1/2 text-[clamp(9px,0.78vw,12px)] tracking-[0.2em] uppercase text-[#dfdfdf] pointer-events-none">TO:</span>
              <input
                type="date"
                value={filters.date_to ?? ''}
                onChange={e => update({ date_to: e.target.value || undefined })}
                className="w-full bg-[#424242] border-0 pl-[clamp(40px,3.8vw,58px)] pr-[clamp(10px,1.1vw,16px)] py-[clamp(12px,1.68vh,24px)] text-[clamp(9px,0.78vw,12px)] tracking-[0.15em] text-[#dfdfdf] focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Entry count */}
        <p className="text-[clamp(8px,0.65vw,10px)] tracking-[0.28em] uppercase text-[#3a3a3a]">
          {entryCount} {entryCount === 1 ? 'ENTRY' : 'ENTRIES'}
        </p>
      </div>

      {/* ── Bottom nav buttons ── */}
      <div className="px-[clamp(16px,2.1vw,30px)] pb-[clamp(16px,2.5vh,36px)] pt-[clamp(12px,1.8vh,24px)]">
        <div className="flex gap-[clamp(6px,0.8vw,12px)]">
          {/* Map */}
          <button
            onClick={() => router.push('/map')}
            className={`flex items-center justify-center flex-shrink-0 w-[clamp(36px,3.1vw,48px)] h-[clamp(36px,3.1vw,48px)] transition-colors ${pathname === '/map' ? 'bg-[#424242]' : 'bg-[#2a2b2b] hover:bg-[#333]'}`}
            title="Map"
          >
            <MapIcon />
          </button>
          {/* Submit */}
          <button
            onClick={() => router.push('/submit')}
            className={`flex items-center justify-center flex-shrink-0 w-[clamp(36px,3.1vw,48px)] h-[clamp(36px,3.1vw,48px)] transition-colors ${pathname === '/submit' ? 'bg-[#424242]' : 'bg-[#2a2b2b] hover:bg-[#333]'}`}
            title="Submit sighting"
          >
            <CameraIcon />
          </button>
          {/* Login / Account */}
          <button
            onClick={() => user ? handleLogout() : setShowAuth(true)}
            className="flex items-center justify-center flex-shrink-0 w-[clamp(36px,3.1vw,48px)] h-[clamp(36px,3.1vw,48px)] bg-[#2a2b2b] hover:bg-[#333] transition-colors"
            title={user ? 'Log out' : 'Log in'}
          >
            <PersonIcon />
          </button>
        </div>
        {user && (
          <p className="text-[clamp(7px,0.6vw,9px)] tracking-[0.2em] uppercase text-[#3a3a3a] mt-2 truncate">
            {user.email}
          </p>
        )}
      </div>

      {/* ── Auth overlay ── */}
      {showAuth && (
        <div className="absolute inset-0 z-50 bg-[#141415] flex flex-col">
          <div className="flex items-center justify-between px-[clamp(16px,2.1vw,30px)] pt-[clamp(24px,3.5vh,52px)] pb-0">
            <span className={sectionLabel}>ACCOUNT</span>
            <button onClick={() => setShowAuth(false)} className="text-[#444] hover:text-[#dfdfdf] text-lg leading-none">×</button>
          </div>
          <div className="flex-1 px-[clamp(16px,2.1vw,30px)] pt-[clamp(20px,3vh,44px)]">
            <AuthModal onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
