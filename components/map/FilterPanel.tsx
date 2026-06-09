'use client'

import { useEffect, useState } from 'react'
import { EntryFilters, GraffitiType, GRAFFITI_TYPES } from '@/types'

interface Props {
  filters: EntryFilters
  onChange: (filters: EntryFilters) => void
}

export function FilterPanel({ filters, onChange }: Props) {
  const [writers, setWriters] = useState<string[]>([])
  const [writerInput, setWriterInput] = useState(filters.writer ?? '')

  useEffect(() => {
    fetch('/api/writers')
      .then(r => r.json())
      .then(d => setWriters(d.writers ?? []))
      .catch(() => {})
  }, [])

  function update(patch: Partial<EntryFilters>) {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Filters</h2>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Writer</label>
        <input
          list="writers-list"
          value={writerInput}
          onChange={e => {
            setWriterInput(e.target.value)
            update({ writer: e.target.value || undefined })
          }}
          placeholder="Any writer"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-yellow-400"
        />
        <datalist id="writers-list">
          {writers.map(w => <option key={w} value={w} />)}
        </datalist>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Type</label>
        <select
          value={filters.type ?? ''}
          onChange={e => update({ type: (e.target.value as GraffitiType) || undefined })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-yellow-400"
        >
          <option value="">All types</option>
          {GRAFFITI_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">From</label>
        <input
          type="date"
          value={filters.date_from ?? ''}
          onChange={e => update({ date_from: e.target.value || undefined })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-yellow-400"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">To</label>
        <input
          type="date"
          value={filters.date_to ?? ''}
          onChange={e => update({ date_to: e.target.value || undefined })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-yellow-400"
        />
      </div>

      <button
        onClick={() => { onChange({}); setWriterInput('') }}
        className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
      >
        Clear filters
      </button>
    </div>
  )
}
