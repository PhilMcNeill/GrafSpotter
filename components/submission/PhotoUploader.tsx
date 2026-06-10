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
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [gpsSource, setGpsSource] = useState<'exif' | 'none' | null>(null)

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file))
    setGpsSource(null)
    onPhoto(file)

    // Extract GPS from EXIF in parallel with AI analysis
    const [exif] = await Promise.allSettled([
      exifr.gps(file),
    ])

    if (exif.status === 'fulfilled' && exif.value?.latitude && exif.value?.longitude) {
      onGps({ latitude: exif.value.latitude, longitude: exif.value.longitude })
      setGpsSource('exif')
    } else {
      setGpsSource('none')
    }

    // AI analysis
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

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors"
      >
        {preview ? (
          <div className="relative w-full aspect-video">
            <Image src={preview} alt="Preview" fill className="object-contain rounded-lg" />
          </div>
        ) : (
          <div className="py-4">
            <p className="text-zinc-400 text-sm">Tap to take a photo or select from library</p>
            <p className="text-zinc-600 text-xs mt-1">JPEG or PNG, max 10 MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <div className="mt-2 min-h-[1.25rem] text-center">
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
