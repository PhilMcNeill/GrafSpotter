import { MapContainer } from '@/components/map/MapContainer'

export const metadata = { title: 'Map — GrafSpotter' }

export default function MapPage() {
  return (
    <div className="fixed inset-0 flex">
      <MapContainer />
    </div>
  )
}
