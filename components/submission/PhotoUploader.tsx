'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { AnalyseResponse } from '@/types'
import exifr from 'exifr'

interface GpsCoords {
  latitude: number
  longitude: number
}

interface Props {
  onPhoto: (file: File) => void
  onAnalysis: (result: AnalyseResponse) => void
  onAnalysisError: () => void
  onGps: (coords: GpsCoords) => void
}

export function PhotoUploader({ onPhoto, onAnalysis, onAnalysisError, onGps }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const libraryInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [gpsSource, setGpsSource] = useState<'exif' | 'none' | null>(null)

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file))
    setGpsSource(null)
    onPhoto(file)

    const [exif] = await Promise.allSettled([exifr.gps(file)])

    if (exif.status === 'fulfilled' && exif.value?.latitude && exif.value?.longitude) {
      onGps({ latitude: exif.value.latitude, longitude: exif.value.longitude })
      setGpsSource('exif')
    } else {
      setGpsSource('none')
    }

    setAnalysing(true)
    const fd = new FormData()
    fd.append('photo', file)

    try {
      const res = await fetch('/api/entries/analyse', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Analysis failed')
      const data: AnalyseResponse = await res.json()
      onAnalysis(data)
    } catch {
      onAnalysisError()
    } finally {
      setAnalysing(false)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800">
          <Image src={preview} alt="Preview" fill className="object-contain" />
        </div>
      )}

      {/* Action buttons */}
      <div className={`grid gap-3 ${preview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {!preview && (
          <>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-xl py-8 hover:border-yellow-400 hover:text-yellow-400 transition-colors text-zinc-400"
            >
              <CameraIcon />
              <span className="text-sm font-medium">Take photo</span>
            </button>
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-xl py-8 hover:border-yellow-400 hover:text-yellow-400 transition-colors text-zinc-400"
            >
              <LibraryIcon />
              <span className="text-sm font-medium">Choose from library</span>
            </button>
          </>
        )}

        {preview && (
          <>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 border border-zinc-700 rounded-xl py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
            >
              <CameraIcon small />
              Retake
            </button>
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              className="flex items-center justify-center gap-2 border border-zinc-700 rounded-xl py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
            >
              <LibraryIcon small />
              Change
            </button>
          </>
        )}
      </div>

      {/* Hidden inputs — one forces camera, one opens file picker */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={onChange}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onChange}
      />

      <div className="min-h-[1.25rem] text-center">
        {analysing && (
          <p className="text-yellow-400 text-xs animate-pulse">Analysing photo for graffiti…</p>
        )}
        {!analysing && gpsSource === 'exif' && (
          <p className="text-green-400 text-xs">Location read from photo</p>
        )}
        {!analysing && gpsSource === 'none' && preview && (
          <p className="text-zinc-500 text-xs">No GPS in photo — enter location manually</p>
        )}
      </div>
    </div>
  )
}

function CameraIcon({ small }: { small?: boolean }) {
  const size = small ? 16 : 28
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function LibraryIcon({ small }: { small?: boolean }) {
  const size = small ? 16 : 28
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
