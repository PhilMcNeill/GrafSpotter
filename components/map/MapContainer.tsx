'use client'

import dynamic from 'next/dynamic'
import { EntryFilters } from '@/types'
import { FilterPanel } from './FilterPanel'
import { useEntries } from '@/hooks/useEntries'
import { useState } from 'react'

const MapView = dynamic(() => import('./MapView').then(m => m.MapView), {
  ssr: false,
  loading: () => <div className="flex-1 bg-zinc-900 animate-pulse" />,
})

export function MapContainer() {
  const [filters, setFilters] = useState<EntryFilters>({})
  const { entries, isLoading } = useEntries(filters)

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      <div className="w-56 flex-shrink-0 hidden md:flex flex-col border-r border-zinc-800">
        <FilterPanel filters={filters} onChange={setFilters} entryCount={entries.length} />
      </div>
      <div className="flex-1 flex flex-col min-h-[400px] md:min-h-0">
        <MapView entries={entries} loading={isLoading} />
      </div>
    </div>
  )
}
