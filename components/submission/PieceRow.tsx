'use client'

import { DetectedPiece, GraffitiType, GRAFFITI_TYPES } from '@/types'

interface PieceField {
  piece: DetectedPiece | null
  writer_name: string
  type: GraffitiType
  confirmed: boolean
}

interface Props {
  index: number
  field: PieceField
  onChange: (patch: Partial<PieceField>) => void
  onRemove: () => void
  showRemove: boolean
}

const inputCls = 'w-full bg-[#2a2b2b] border-0 px-[clamp(10px,1.1vw,16px)] py-[clamp(12px,1.68vh,24px)] text-[clamp(9px,0.78vw,12px)] tracking-[0.28em] uppercase text-[#dfdfdf] placeholder-[#555] focus:outline-none focus:ring-1 focus:ring-[#666]'

export function PieceRow({ index, field, onChange, onRemove, showRemove }: Props) {
  const isSuggested = field.piece?.suggested_name != null && !field.confirmed

  return (
    <div className="space-y-px">
      {/* Writer name */}
      <div className="relative">
        {isSuggested && (
          <span className="absolute right-[clamp(10px,1.1vw,16px)] top-1/2 -translate-y-1/2 text-[clamp(7px,0.6vw,9px)] tracking-[0.2em] uppercase text-[#444] pointer-events-none">
            AI
          </span>
        )}
        <input
          value={field.writer_name}
          onChange={e => onChange({ writer_name: e.target.value, confirmed: true })}
          placeholder={`WRITER ${index + 1}`}
          className={inputCls}
          required
        />
      </div>

      {/* Type select */}
      <div className="flex items-center gap-px">
        <select
          value={field.type}
          onChange={e => onChange({ type: e.target.value as GraffitiType })}
          className={`${inputCls} flex-1 appearance-none cursor-pointer`}
        >
          {GRAFFITI_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 px-[clamp(10px,1.1vw,16px)] py-[clamp(12px,1.68vh,24px)] bg-[#2a2b2b] text-[clamp(8px,0.65vw,10px)] tracking-[0.25em] uppercase text-[#444] hover:text-[#dfdfdf] transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
