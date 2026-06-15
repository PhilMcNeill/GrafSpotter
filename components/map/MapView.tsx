'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Entry } from '@/types'
import { format } from 'date-fns'
import type { RefObject } from 'react'

const customIcon = L.icon({
  iconUrl: '/location.svg',
  iconSize: [15, 15],
  iconAnchor: [7, 15],
  popupAnchor: [0, -16],
})

interface Props {
  entries: Entry[]
  loading: boolean
  mapRef: RefObject<L.Map | null>
}

export function MapView({ entries, loading, mapRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const clusterRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [51.505, -0.09],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
      backgroundColor: '#090909',
    } as L.MapOptions)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [mapRef])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
    }

    const group = L.layerGroup()
    clusterRef.current = group

    entries.forEach(entry => {
      const marker = L.marker([entry.latitude, entry.longitude], { icon: customIcon })
      marker.bindPopup(`
        <div style="min-width:210px;background:#111;color:#f4f4f5;font-family:ui-monospace,monospace;font-size:11px;">
          ${entry.photo_url ? `<img src="${entry.photo_url}" style="width:100%;display:block;margin-bottom:10px;max-height:140px;object-fit:cover" />` : ''}
          <div style="font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px">${entry.writer_name}</div>
          <div style="color:#71717a;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2px">${entry.type} &nbsp;·&nbsp; ${format(new Date(entry.date_spotted), 'dd MMM yyyy')}</div>
          ${entry.location_label ? `<div style="color:#52525b;margin-top:2px">${entry.location_label}</div>` : ''}
        </div>
      `, { className: 'graf-popup' })
      group.addLayer(marker)
    })

    group.addTo(map)
  }, [entries, mapRef])

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />
      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#141415] text-[10px] tracking-[0.25em] uppercase text-[#dfdfdf] px-4 py-2 z-[1000]">
          Loading…
        </div>
      )}
    </div>
  )
}
