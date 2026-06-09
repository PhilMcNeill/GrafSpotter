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
      <div className="md:w-64 md:flex-shrink-0 p-3 overflow-y-auto">
        <FilterPanel filters={filters} onChange={setFilters} />
        <p className="text-xs text-zinc-600 mt-3 text-center">
          {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
        </p>
        {entries.length === 0 && !isLoading && (
          <p className="text-xs text-zinc-500 mt-2 text-center">No entries found</p>
        )}
      </div>
      <div className="flex-1 flex flex-col min-h-[400px] md:min-h-0">
        <MapView entries={entries} loading={isLoading} />
      </div>
    </div>
  )
}
