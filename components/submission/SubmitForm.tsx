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

const sectionLabel = 'text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase'
const inputCls = 'w-full bg-[#424242] border-0 px-[clamp(10px,1.1vw,16px)] py-[clamp(12px,1.68vh,24px)] text-[clamp(9px,0.78vw,12px)] tracking-[0.28em] uppercase text-[#dfdfdf] placeholder-[#666] focus:outline-none focus:ring-1 focus:ring-[#666]'

export function SubmitForm({ onDone }: { onDone?: () => void }) {
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

  const handleGps = useCallback(({ latitude, longitude }: { latitude: number; longitude: number }) => {
    setLatitude(latitude.toFixed(6))
    setLongitude(longitude.toFixed(6))
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
    }

    if (onDone) onDone()
    else router.push('/map')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-[clamp(16px,2.1vw,30px)] pt-[clamp(24px,3.5vh,52px)] pb-0">
        <span className={sectionLabel}>SUBMIT</span>
      </div>

      {/* Scrollable body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-[clamp(16px,2.1vw,30px)] pt-[clamp(20px,3.7vh,56px)] space-y-[clamp(20px,3.5vh,52px)]">

        {/* PHOTO */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>PHOTO</p>
          <PhotoUploader
            onPhoto={setPhoto}
            onAnalysis={handleAnalysis}
            onAnalysisError={handleAnalysisError}
            onGps={handleGps}
          />
          {analysisError && (
            <p className="text-[clamp(8px,0.65vw,10px)] tracking-[0.2em] uppercase text-[#444] mt-2">
              AI analysis unavailable — fill in details manually
            </p>
          )}
        </div>

        {/* PIECES */}
        <div>
          <div className="flex items-center justify-between mb-[clamp(8px,1.1vh,16px)]">
            <p className={sectionLabel}>PIECES</p>
            <button
              type="button"
              onClick={() => setPieces(prev => [...prev, emptyPiece()])}
              className="text-[clamp(8px,0.65vw,10px)] tracking-[0.28em] uppercase text-[#444] hover:text-[#dfdfdf] transition-colors"
            >
              + ADD
            </button>
          </div>
          <div className="space-y-px">
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
        </div>

        {/* LOCATION */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>LOCATION</p>
          <div className="space-y-px">
            <input
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              placeholder="LATITUDE"
              required
              className={inputCls}
            />
            <input
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              placeholder="LONGITUDE"
              required
              className={inputCls}
            />
            <input
              value={locationLabel}
              onChange={e => setLocationLabel(e.target.value)}
              placeholder="LABEL (OPTIONAL)"
              className={inputCls}
            />
          </div>
          <button
            type="button"
            onClick={requestGps}
            disabled={gpsLoading}
            className="mt-[clamp(6px,0.8vh,12px)] text-[clamp(8px,0.65vw,10px)] tracking-[0.28em] uppercase text-[#444] hover:text-[#dfdfdf] transition-colors disabled:opacity-40"
          >
            {gpsLoading ? 'LOCATING…' : '+ USE MY LOCATION'}
          </button>
        </div>

        {/* DATE */}
        <div>
          <p className={`${sectionLabel} mb-[clamp(8px,1.1vh,16px)]`}>DATE</p>
          <input
            type="date"
            value={dateSpotted}
            onChange={e => setDateSpotted(e.target.value)}
            required
            className={`${inputCls} [color-scheme:dark]`}
          />
        </div>

        {submitError && (
          <p className="text-[clamp(8px,0.65vw,10px)] tracking-[0.2em] uppercase text-red-400">{submitError}</p>
        )}

        {/* Spacer so submit button doesn't overlap content */}
        <div className="h-4" />
      </form>

      {/* Submit button — pinned to bottom */}
      <div className="px-[clamp(16px,2.1vw,30px)] pb-[clamp(16px,2.5vh,36px)] pt-[clamp(12px,1.8vh,24px)]">
        <button
          type="submit"
          form=""
          disabled={submitting || !photo}
          onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
          className="w-full bg-[#424242] text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase py-[clamp(12px,1.68vh,24px)] hover:bg-[#555] transition-colors disabled:opacity-40"
        >
          {submitting ? 'SUBMITTING…' : `SUBMIT ${pieces.length > 1 ? `${pieces.length} PIECES` : 'ENTRY'}`}
        </button>
      </div>
    </div>
  )
}
