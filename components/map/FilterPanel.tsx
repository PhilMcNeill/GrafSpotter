'use client'

import { useState } from 'react'
import { EntryFilters, GraffitiType } from '@/types'

interface Props {
  filters: EntryFilters
  onChange: (filters: EntryFilters) => void
  entryCount: number
}

const TYPE_GRID: GraffitiType[] = ['tag', 'throw-up', 'sticker', 'stencil', 'piece', 'mural']

const sectionLabel = 'text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase'

export function FilterPanel({ filters, onChange, entryCount }: Props) {
  const [writerInput, setWriterInput] = useState(filters.writer ?? '')

  function update(patch: Partial<EntryFilters>) {
    onChange({ ...filters, ...patch })
  }

  function toggleType(type: GraffitiType) {
    update({ type: filters.type === type ? undefined : type })
  }

  const hasFilters = !!(filters.writer || filters.type || filters.date_from || filters.date_to)

  const cellBase = 'flex items-center justify-center text-[clamp(8px,0.72vw,11px)] tracking-[0.28em] hover:tracking-[0.40em] uppercase transition-[letter-spacing,background-color] duration-300 cursor-pointer py-[clamp(12px,1.68vh,24px)]'

  return (
    <div className="h-full flex flex-col bg-[#141415] select-none overflow-hidden">

      {/* Header */}
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[clamp(16px,2.1vw,30px)] space-y-[clamp(20px,3.5vh,52px)] pt-[clamp(20px,3.7vh,56px)] pb-[clamp(16px,2.5vh,36px)]">

        {/* WRITER */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>WRITER</p>
          <input
            list="writers-list"
            value={writerInput}
            onChange={e => { setWriterInput(e.target.value); update({ writer: e.target.value || undefined }) }}
            placeholder="ANY"
            className="w-full bg-[#424242] border-0 px-[clamp(10px,1.1vw,16px)] py-[clamp(12px,1.68vh,24px)] text-[clamp(9px,0.78vw,12px)] tracking-[0.28em] uppercase text-[#dfdfdf] placeholder-[#dfdfdf] focus:outline-none focus:ring-1 focus:ring-[#666]"
          />
          <datalist id="writers-list" />
        </div>

        {/* TYPE */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>TYPE</p>
          <div className="grid grid-cols-2 gap-px bg-[#222323]">
            {TYPE_GRID.map(t => (
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
    </div>
  )
}
