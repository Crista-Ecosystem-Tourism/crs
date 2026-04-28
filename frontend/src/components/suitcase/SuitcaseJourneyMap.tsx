import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

export type JourneyMarker = {
  id: string
  title: string
  subtitle: string
  lat: number
  lng: number
}

function markerIcon() {
  return new DivIcon({
    className: 'suitcase-journey-marker',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff">✈</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

type Props = {
  markers: JourneyMarker[]
  className?: string
  /** когда одна точка — не зумим слишком близко */
  minZoom?: number
}

export function SuitcaseJourneyMap({ markers, className, minZoom = 2 }: Props) {
  const center: [number, number] = useMemo(() => {
    if (!markers.length) return [55, 37]
    const lat = markers.reduce((s, m) => s + m.lat, 0) / markers.length
    const lng = markers.reduce((s, m) => s + m.lng, 0) / markers.length
    return [lat, lng]
  }, [markers])

  return (
    <div className={cn('rounded-2xl overflow-hidden border border-border', className)}>
      <MapContainer
        center={center}
        zoom={markers.length <= 1 ? 4 : 3}
        minZoom={minZoom}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={markerIcon()}>
            <Popup>
              <div className="text-sm font-semibold">{m.title}</div>
              <div className="text-xs text-neutral-600">{m.subtitle}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
