'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Entry } from '@/types'
import { format } from 'date-fns'

// Fix default marker icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  entries: Entry[]
  loading: boolean
}

export function MapView({ entries, loading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [51.505, -0.09],
      zoom: 12,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
    }

    const group = L.layerGroup()
    clusterRef.current = group

    entries.forEach(entry => {
      const marker = L.marker([entry.latitude, entry.longitude])
      marker.bindPopup(`
        <div style="min-width:200px">
          ${entry.photo_url ? `<img src="${entry.photo_url}" style="width:100%;border-radius:6px;margin-bottom:8px;max-height:150px;object-fit:cover" />` : ''}
          <div style="font-weight:700;font-size:1rem;margin-bottom:2px">${entry.writer_name}</div>
          <div style="font-size:0.75rem;color:#888;margin-bottom:4px">${entry.type} · ${format(new Date(entry.date_spotted), 'dd MMM yyyy')}</div>
          ${entry.location_label ? `<div style="font-size:0.75rem;color:#aaa">${entry.location_label}</div>` : ''}
        </div>
      `)
      group.addLayer(marker)
    })

    group.addTo(map)
  }, [entries])

  return (
    <div className="relative flex-1">
      <div ref={containerRef} className="absolute inset-0" />
      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-sm px-3 py-1.5 rounded-full z-[1000]">
          Loading…
        </div>
      )}
    </div>
  )
}
