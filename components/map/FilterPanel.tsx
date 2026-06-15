'use client'

import { useEffect, useState } from 'react'
import { EntryFilters, GraffitiType, GRAFFITI_TYPES } from '@/types'

interface Props {
  filters: EntryFilters
  onChange: (filters: EntryFilters) => void
  entryCount: number
}

const TYPE_ROWS: GraffitiType[][] = [
  ['tag', 'throw-up'],
  ['sticker', 'stencil'],
  ['piece', 'mural'],
]

export function FilterPanel({ filters, onChange, entryCount }: Props) {
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

  function toggleType(type: GraffitiType) {
    update({ type: filters.type === type ? undefined : type })
  }

  const hasFilters = !!(filters.writer || filters.type || filters.date_from || filters.date_to)

  return (
    <div className="h-full flex flex-col bg-[#111] text-zinc-100 font-mono text-xs select-none">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-800">
        <p className="text-zinc-500 tracking-widest uppercase text-[10px]">Filters</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">

        {/* Writer */}
        <section className="px-5 py-4 space-y-2">
          <p className="text-zinc-500 tracking-widest uppercase text-[10px]">Writer</p>
          <input
            list="writers-list"
            value={writerInput}
            onChange={e => {
              setWriterInput(e.target.value)
              update({ writer: e.target.value || undefined })
            }}
            placeholder="Any"
            className="w-full bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <datalist id="writers-list">
            {writers.map(w => <option key={w} value={w} />)}
          </datalist>
        </section>

        {/* Type */}
        <section className="px-5 py-4 space-y-2">
          <p className="text-zinc-500 tracking-widest uppercase text-[10px]">Type</p>
          <div className="space-y-1.5">
            {TYPE_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-1.5">
                {row.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-2 py-1.5 text-[10px] tracking-widest uppercase border transition-colors text-left ${
                      filters.type === type
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                        : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Date range */}
        <section className="px-5 py-4 space-y-2">
          <p className="text-zinc-500 tracking-widest uppercase text-[10px]">Date range</p>
          <div className="space-y-1.5">
            <div>
              <p className="text-zinc-600 text-[10px] mb-1">From</p>
              <input
                type="date"
                value={filters.date_from ?? ''}
                onChange={e => update({ date_from: e.target.value || undefined })}
                className="w-full bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
            <div>
              <p className="text-zinc-600 text-[10px] mb-1">To</p>
              <input
                type="date"
                value={filters.date_to ?? ''}
                onChange={e => update({ date_to: e.target.value || undefined })}
                className="w-full bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-800 flex items-center justify-between">
        <p className="text-zinc-600 text-[10px] tracking-widest uppercase">
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </p>
        {hasFilters && (
          <button
            onClick={() => { onChange({}); setWriterInput('') }}
            className="text-[10px] tracking-widest uppercase text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
