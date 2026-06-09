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

export function PieceRow({ index, field, onChange, onRemove, showRemove }: Props) {
  const isSuggested = field.piece?.suggested_name != null && !field.confirmed

  return (
    <div className="border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Piece {index + 1}
        </span>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-400"
          >
            Remove
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Writer name *</label>
        {isSuggested && (
          <p className="text-xs text-yellow-400 mb-1">
            AI suggestion — please confirm or correct
          </p>
        )}
        <input
          value={field.writer_name}
          onChange={e => onChange({ writer_name: e.target.value, confirmed: true })}
          placeholder="e.g. SNEK"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Type *</label>
        <select
          value={field.type}
          onChange={e => onChange({ type: e.target.value as GraffitiType })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        >
          {GRAFFITI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  )
}
