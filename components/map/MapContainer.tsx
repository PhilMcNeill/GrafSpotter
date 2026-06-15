'use client'

import dynamic from 'next/dynamic'
import { EntryFilters } from '@/types'
import { FilterPanel } from './FilterPanel'
import { SubmitForm } from '@/components/submission/SubmitForm'
import { useEntries } from '@/hooks/useEntries'
import { useState, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

const MapView = dynamic(() => import('./MapView').then(m => m.MapView), {
  ssr: false,
  loading: () => <div className="flex-1 bg-black animate-pulse" />,
})

export function MapContainer() {
  const [filters, setFilters] = useState<EntryFilters>({})
  const { entries, isLoading } = useEntries(filters)
  const mapRef = useRef<LeafletMap | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)

  function zoom(direction: 'in' | 'out') {
    if (!mapRef.current) return
    direction === 'in' ? mapRef.current.zoomIn() : mapRef.current.zoomOut()
  }

  const zoomBtn = 'flex items-center justify-center w-[clamp(36px,3.1vw,48px)] h-[clamp(36px,3.1vw,48px)] bg-[#141415] text-[#dfdfdf] text-lg hover:bg-[#2a2b2b] transition-colors select-none font-mono leading-none'

  return (
    <div className="flex w-full h-full overflow-hidden bg-black">
      {/* Sidebar */}
      <div
        className="relative flex-shrink-0 flex flex-col"
        style={{ width: 'clamp(220px, 20.8vw, 400px)' }}
      >
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          entryCount={entries.length}
          onSubmit={() => setShowSubmit(true)}
        />
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        <MapView entries={entries} loading={isLoading} mapRef={mapRef} />

        {/* Zoom controls */}
        <div
          className="absolute z-[1000] flex flex-col"
          style={{ top: 'clamp(16px, 2.5vh, 40px)', left: 'clamp(10px, 0.8vw, 14px)' }}
        >
          <button className={zoomBtn} onClick={() => zoom('in')} aria-label="Zoom in">+</button>
          <div className="h-px bg-[#222]" />
          <button className={zoomBtn} onClick={() => zoom('out')} aria-label="Zoom out">−</button>
        </div>

        {/* Submit modal — slides in over the map */}
        {showSubmit && (
          <div className="absolute inset-0 z-[2000] flex items-stretch justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowSubmit(false)}
            />
            {/* Panel */}
            <div
              className="relative flex flex-col bg-[#141415] border-l border-[#222323] overflow-hidden h-full"
              style={{ width: 'clamp(280px, 28vw, 480px)' }}
            >
              {/* Close */}
              <button
                onClick={() => setShowSubmit(false)}
                className="absolute top-[clamp(20px,2.8vh,40px)] right-[clamp(16px,2.1vw,30px)] text-[#444] hover:text-[#dfdfdf] transition-colors text-xl leading-none z-10"
              >
                ×
              </button>
              <SubmitForm onDone={() => setShowSubmit(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
