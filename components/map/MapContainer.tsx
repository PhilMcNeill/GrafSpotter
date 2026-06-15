'use client'

import dynamic from 'next/dynamic'
import { EntryFilters } from '@/types'
import { FilterPanel } from './FilterPanel'
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

  function zoom(direction: 'in' | 'out') {
    if (!mapRef.current) return
    direction === 'in' ? mapRef.current.zoomIn() : mapRef.current.zoomOut()
  }

  // Figma: zoom buttons sit just right of sidebar edge, top ~40px from top
  // Sidebar ~20.8vw, buttons at sidebar_width + ~12px gap
  const zoomBtn = 'flex items-center justify-center w-[clamp(36px,3.1vw,48px)] h-[clamp(36px,3.1vw,48px)] bg-[#141415] text-[#dfdfdf] text-lg hover:bg-[#2a2b2b] transition-colors select-none font-mono leading-none'

  return (
    <div className="flex w-full h-full overflow-hidden bg-black">
      {/* Sidebar */}
      <div
        className="relative flex-shrink-0 flex flex-col"
        style={{ width: 'clamp(220px, 20.8vw, 400px)' }}
      >
        <FilterPanel filters={filters} onChange={setFilters} entryCount={entries.length} />
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        <MapView entries={entries} loading={isLoading} mapRef={mapRef} />

        {/* Zoom controls — top-left of map area (just right of sidebar) */}
        <div
          className="absolute z-[1000] flex flex-col"
          style={{ top: 'clamp(16px, 2.5vh, 40px)', left: 'clamp(10px, 0.8vw, 14px)' }}
        >
          <button className={zoomBtn} onClick={() => zoom('in')} aria-label="Zoom in">+</button>
          <div className="h-px bg-[#222]" />
          <button className={zoomBtn} onClick={() => zoom('out')} aria-label="Zoom out">−</button>
        </div>
      </div>
    </div>
  )
}
