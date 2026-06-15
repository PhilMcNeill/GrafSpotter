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

  const zoomBtn = "flex items-center justify-center w-12 h-12 bg-[#141415] text-[#dfdfdf] text-xl hover:bg-[#2a2b2b] transition-colors select-none"

  return (
    <div className="flex-1 flex overflow-hidden bg-black">
      {/* Filter panel */}
      <div className="w-52 flex-shrink-0 hidden md:flex flex-col border-r border-[#222]">
        <FilterPanel filters={filters} onChange={setFilters} entryCount={entries.length} />
      </div>

      {/* Map + zoom controls */}
      <div className="flex-1 relative min-h-[400px] md:min-h-0">
        <MapView entries={entries} loading={isLoading} mapRef={mapRef} />

        {/* Custom zoom controls — top-right */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-px">
          <button className={zoomBtn} onClick={() => zoom('in')} aria-label="Zoom in">+</button>
          <button className={zoomBtn} onClick={() => zoom('out')} aria-label="Zoom out">—</button>
        </div>
      </div>
    </div>
  )
}
