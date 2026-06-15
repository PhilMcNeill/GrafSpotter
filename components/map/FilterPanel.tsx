'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { EntryFilters, GraffitiType, GRAFFITI_TYPES } from '@/types'

interface Props {
  filters: EntryFilters
  onChange: (filters: EntryFilters) => void
  entryCount: number
}

const TYPE_GRID: GraffitiType[][] = [
  ['tag', 'throw-up'],
  ['sticker', 'stencil'],
  ['piece', 'mural'],
]

export function FilterPanel({ filters, onChange, entryCount }: Props) {
  const [writers, setWriters] = useState<string[]>([])
  const [writerInput, setWriterInput] = useState(filters.writer ?? '')
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/writers')
      .then(r => r.json())
      .then(d => setWriters(d.writers ?? []))
      .catch(() => {})
  }, [])

  function update(patch: Partial<EntryFilters>) {
    onChange({ ...filters, ...patch })
  }

  function toggleType(type: GraffitiType) {
    update({ type: filters.type === type ? undefined : type })
  }

  const hasFilters = !!(filters.writer || filters.type || filters.date_from || filters.date_to)

  const sectionLabel = "block text-[#dfdfdf] text-xs tracking-[0.3em] uppercase mb-3"
  const cell = (active: boolean) =>
    `flex items-center justify-center px-2 py-3 text-[10px] tracking-[0.25em] uppercase border transition-colors cursor-pointer ${
      active
        ? 'bg-[#424242] text-[#dfdfdf] border-[#424242]'
        : 'bg-[#2a2b2b] text-[#dfdfdf] border-[#2a2b2b] hover:bg-[#333]'
    }`

  return (
    <div className="h-full flex flex-col bg-[#141415]" style={{ fontFamily: 'var(--font-ibm-plex-mono), ui-monospace, monospace' }}>

      {/* Header */}
      <div className="px-5 pt-6 pb-5">
        <span className="text-[#dfdfdf] text-sm tracking-[0.35em] uppercase">FILTER</span>
        {hasFilters && (
          <button
            onClick={() => { onChange({}); setWriterInput('') }}
            className="float-right text-[10px] tracking-[0.25em] uppercase text-[#666] hover:text-[#dfdfdf] transition-colors mt-0.5"
          >
            CLEAR
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-4">

        {/* Writer */}
        <div>
          <label className={sectionLabel}>WRITER</label>
          <input
            list="writers-list"
            value={writerInput}
            onChange={e => {
              setWriterInput(e.target.value)
              update({ writer: e.target.value || undefined })
            }}
            placeholder="ANY"
            className="w-full bg-[#424242] border-0 px-3 py-3 text-[10px] tracking-[0.25em] uppercase text-[#dfdfdf] placeholder-[#dfdfdf] focus:outline-none focus:ring-1 focus:ring-[#666]"
          />
          <datalist id="writers-list">
            {writers.map(w => <option key={w} value={w} />)}
          </datalist>
        </div>

        {/* Type */}
        <div>
          <label className={sectionLabel}>TYPE</label>
          <div className="grid grid-cols-2 gap-px bg-[#111]">
            {TYPE_GRID.map((row, i) =>
              row.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={cell(filters.type === type)}
                >
                  {type}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className={sectionLabel}>DATE RANGE</label>
          <div className="space-y-px bg-[#111]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.25em] text-[#dfdfdf] pointer-events-none">
                FROM:
              </span>
              <input
                type="date"
                value={filters.date_from ?? ''}
                onChange={e => update({ date_from: e.target.value || undefined })}
                className="w-full bg-[#424242] border-0 pl-14 pr-3 py-3 text-[10px] tracking-[0.2em] text-[#dfdfdf] focus:outline-none focus:ring-1 focus:ring-[#666] [color-scheme:dark]"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.25em] text-[#dfdfdf] pointer-events-none">
                TO:
              </span>
              <input
                type="date"
                value={filters.date_to ?? ''}
                onChange={e => update({ date_to: e.target.value || undefined })}
                className="w-full bg-[#424242] border-0 pl-10 pr-3 py-3 text-[10px] tracking-[0.2em] text-[#dfdfdf] focus:outline-none focus:ring-1 focus:ring-[#666] [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Entry count */}
        <p className="text-[#555] text-[9px] tracking-[0.25em] uppercase">
          {entryCount} {entryCount === 1 ? 'ENTRY' : 'ENTRIES'}
        </p>

      </div>

      {/* Bottom nav */}
      <div className="flex border-t border-[#222]">
        <Link
          href="/map"
          className={`flex items-center justify-center w-14 h-14 transition-colors ${pathname === '/map' ? 'bg-[#424242]' : 'bg-[#141415] hover:bg-[#2a2b2b]'}`}
          title="Map"
        >
          <MapIcon />
        </Link>
        <Link
          href="/submit"
          className={`flex items-center justify-center w-14 h-14 transition-colors ${pathname === '/submit' ? 'bg-[#424242]' : 'bg-[#141415] hover:bg-[#2a2b2b]'}`}
          title="Submit"
        >
          <CameraIcon />
        </Link>
      </div>
    </div>
  )
}

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
