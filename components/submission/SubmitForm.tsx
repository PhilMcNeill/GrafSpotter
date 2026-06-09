'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoUploader } from './PhotoUploader'
import { PieceRow } from './PieceRow'
import { AnalyseResponse, DetectedPiece, GraffitiType } from '@/types'

interface PieceField {
  piece: DetectedPiece | null
  writer_name: string
  type: GraffitiType
  confirmed: boolean
}

function emptyPiece(): PieceField {
  return { piece: null, writer_name: '', type: 'tag', confirmed: false }
}

export function SubmitForm() {
  const router = useRouter()
  const [photo, setPhoto] = useState<File | null>(null)
  const [detectionId, setDetectionId] = useState<string | null>(null)
  const [pieces, setPieces] = useState<PieceField[]>([emptyPiece()])
  const [analysisError, setAnalysisError] = useState(false)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const [dateSpotted, setDateSpotted] = useState(new Date().toISOString().split('T')[0])
  const [gpsLoading, setGpsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleAnalysis = useCallback((result: AnalyseResponse) => {
    setDetectionId(result.detection_id)
    setAnalysisError(false)
    if (result.pieces.length === 0) {
      setPieces([emptyPiece()])
    } else {
      setPieces(result.pieces.map(p => ({
        piece: p,
        writer_name: p.suggested_name ?? '',
        type: 'tag',
        confirmed: false,
      })))
    }
  }, [])

  const handleAnalysisError = useCallback(() => {
    setAnalysisError(true)
    setPieces([emptyPiece()])
  }, [])

  function requestGps() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude.toFixed(6))
        setLongitude(pos.coords.longitude.toFixed(6))
        setGpsLoading(false)
      },
      () => setGpsLoading(false)
    )
  }

  function updatePiece(index: number, patch: Partial<PieceField>) {
    setPieces(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p))
  }

  function removePiece(index: number) {
    setPieces(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!photo) { setSubmitError('Please select a photo'); return }

    setSubmitting(true)
    setSubmitError(null)

    const results: string[] = []

    for (const [i, piece] of pieces.entries()) {
      if (!piece.writer_name.trim()) {
        setSubmitError(`Piece ${i + 1}: writer name is required`)
        setSubmitting(false)
        return
      }

      const fd = new FormData()
      fd.append('photo', photo)
      fd.append('writer_name', piece.writer_name.trim())
      fd.append('type', piece.type)
      fd.append('latitude', latitude)
      fd.append('longitude', longitude)
      if (locationLabel) fd.append('location_label', locationLabel)
      fd.append('date_spotted', dateSpotted)
      if (detectionId) fd.append('ai_detection_id', detectionId)
      if (piece.piece?.suggested_name) fd.append('ai_suggested_name', piece.piece.suggested_name)
      if (piece.piece?.bounding_box) fd.append('bounding_box', JSON.stringify(piece.piece.bounding_box))

      const res = await fetch('/api/entries', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data.error ?? 'Submission failed')
        setSubmitting(false)
        return
      }
      const entry = await res.json()
      results.push(entry.id)
    }

    router.push('/map')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Photo</h2>
        <PhotoUploader
          onPhoto={setPhoto}
          onAnalysis={handleAnalysis}
          onAnalysisError={handleAnalysisError}
        />
        {analysisError && (
          <p className="text-zinc-500 text-xs mt-2">
            AI analysis unavailable — please fill in the details manually.
          </p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Pieces</h2>
          <button
            type="button"
            onClick={() => setPieces(prev => [...prev, emptyPiece()])}
            className="text-xs text-yellow-400 hover:text-yellow-300"
          >
            + Add piece
          </button>
        </div>
        <div className="space-y-3">
          {pieces.map((piece, i) => (
            <PieceRow
              key={i}
              index={i}
              field={piece}
              onChange={patch => updatePiece(i, patch)}
              onRemove={() => removePiece(i)}
              showRemove={pieces.length > 1}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Location</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Latitude *</label>
              <input
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                placeholder="51.5194"
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Longitude *</label>
              <input
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                placeholder="-0.1270"
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={requestGps}
            disabled={gpsLoading}
            className="text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
          >
            {gpsLoading ? 'Getting location…' : 'Use my current location'}
          </button>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Location label (optional)</label>
            <input
              value={locationLabel}
              onChange={e => setLocationLabel(e.target.value)}
              placeholder="e.g. Shoreditch, London"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Date</h2>
        <input
          type="date"
          value={dateSpotted}
          onChange={e => setDateSpotted(e.target.value)}
          required
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
      </section>

      {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting || !photo}
        className="w-full bg-yellow-400 text-zinc-950 font-semibold py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : `Submit ${pieces.length > 1 ? `${pieces.length} pieces` : 'entry'}`}
      </button>
    </form>
  )
}
