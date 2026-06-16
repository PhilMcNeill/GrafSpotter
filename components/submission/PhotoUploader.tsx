'use client'

import { useState } from 'react'
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
  const [preview, setPreview] = useState<string | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [gpsSource, setGpsSource] = useState<'exif' | 'none' | null>(null)

  async function compressImage(file: File): Promise<File> {
    const MAX_DIM = 1920
    const QUALITY = 0.82
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    await new Promise<void>(res => { img.onload = () => res(); img.src = url })
    URL.revokeObjectURL(url)
    const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b as Blob), 'image/jpeg', QUALITY))
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  }

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file))
    setGpsSource(null)

    // Read EXIF before compression (compression strips metadata)
    const [exif] = await Promise.allSettled([exifr.gps(file)])
    if (exif.status === 'fulfilled' && exif.value?.latitude && exif.value?.longitude) {
      onGps({ latitude: exif.value.latitude, longitude: exif.value.longitude })
      setGpsSource('exif')
    } else {
      setGpsSource('none')
    }

    const compressed = await compressImage(file)
    onPhoto(compressed)

    setAnalysing(true)
    const fd = new FormData()
    fd.append('photo', compressed)
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
    e.target.value = ''
  }

  const btnCls = 'flex items-center justify-center gap-2 bg-[#2a2b2b] text-[#dfdfdf] text-[clamp(8px,0.72vw,11px)] tracking-[0.28em] uppercase py-[clamp(12px,1.68vh,24px)] hover:bg-[#333] transition-colors'

  return (
    <div className="space-y-px">
      {/* Preview */}
      {preview && (
        <div className="relative w-full aspect-video overflow-hidden bg-[#0d0d0d] mb-px">
          <Image src={preview} alt="Preview" fill className="object-contain" />
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-px">
        <label className={`${btnCls} cursor-pointer`}>
          <CameraIcon /> {preview ? 'RETAKE' : 'CAMERA'}
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={onChange} />
        </label>
        <label className={`${btnCls} cursor-pointer`}>
          <LibraryIcon /> {preview ? 'CHANGE' : 'LIBRARY'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onChange} />
        </label>
      </div>

      {/* Status */}
      <div className="min-h-[1.2rem] pt-1">
        {analysing && (
          <p className="text-[clamp(8px,0.65vw,10px)] tracking-[0.25em] uppercase text-[#555] animate-pulse">Analysing…</p>
        )}
        {!analysing && gpsSource === 'exif' && (
          <p className="text-[clamp(8px,0.65vw,10px)] tracking-[0.25em] uppercase text-[#444]">Location read from photo</p>
        )}
        {!analysing && gpsSource === 'none' && preview && (
          <p className="text-[clamp(8px,0.65vw,10px)] tracking-[0.25em] uppercase text-[#444]">No GPS — enter location manually</p>
        )}
      </div>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
