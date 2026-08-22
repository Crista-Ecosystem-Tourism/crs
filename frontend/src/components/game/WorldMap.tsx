import { useMemo, useRef } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import type { Layer, LeafletMouseEvent, PathOptions } from 'leaflet'
import type { Feature, Geometry } from 'geojson'
import worldData from '@/data/world-countries.json'
import { openedCountryIso } from '@/mocks/game'
import 'leaflet/dist/leaflet.css'

interface CountryProps {
  iso: string
  name: string
}

interface WorldMapProps {
  /** Процент закрытия по ISO-коду страны */
  progressByIso: (iso: string) => number
  selectedIso: string | null
  onSelect: (iso: string) => void
}

const world = worldData as unknown as {
  type: 'FeatureCollection'
  features: Feature<Geometry, CountryProps>[]
}

/** Карта не должна уезжать в пустоту за пределы мира */
function FitWorld() {
  const map = useMap()
  const done = useRef(false)
  if (!done.current) {
    done.current = true
    map.setMinZoom(1.3)
    map.setMaxZoom(5)
    map.setMaxBounds([
      [-85, -180],
      [85, 180],
    ])
  }
  return null
}

export function WorldMap({ progressByIso, selectedIso, onSelect }: WorldMapProps) {
  const styleFor = useMemo(
    () =>
      (feature?: Feature<Geometry, CountryProps>): PathOptions => {
        const iso = feature?.properties?.iso ?? ''
        const opened = openedCountryIso.has(iso)
        const selected = iso === selectedIso

        if (!opened) {
          // Белое пятно: очертания мира читаются, содержимое скрыто
          return {
            fillColor: '#332B57',
            fillOpacity: 0.85,
            color: '#4A3F7A',
            weight: 0.8,
            opacity: 0.9,
          }
        }

        const progress = progressByIso(iso)
        // Чем больше закрыто, тем ярче тил
        const fillOpacity = 0.4 + (progress / 100) * 0.45

        return {
          fillColor: '#3BA8B8',
          fillOpacity: selected ? Math.min(fillOpacity + 0.18, 0.95) : fillOpacity,
          color: selected ? '#7ED3E0' : '#5BC4F7',
          weight: selected ? 2 : 1,
          opacity: 1,
        }
      },
    [progressByIso, selectedIso]
  )

  const onEachCountry = useMemo(
    () => (feature: Feature<Geometry, CountryProps>, layer: Layer) => {
      const { iso, name } = feature.properties
      const opened = openedCountryIso.has(iso)

      layer.bindTooltip(
        opened ? name : 'Белое пятно: маршрут сюда ещё не строили',
        { direction: 'top', className: 'crista-map-tip', sticky: true }
      )

      if (!opened) return

      layer.on({
        click: () => onSelect(iso),
        mouseover: (e: LeafletMouseEvent) => {
          const target = e.target as Layer & { setStyle?: (o: PathOptions) => void }
          target.setStyle?.({ weight: 2, color: '#7ED3E0' })
        },
        mouseout: (e: LeafletMouseEvent) => {
          const target = e.target as Layer & { setStyle?: (o: PathOptions) => void }
          target.setStyle?.(styleFor(feature))
        },
      })
    },
    [onSelect, styleFor]
  )

  return (
    <MapContainer
      center={[25, 10]}
      zoom={1.6}
      minZoom={1.3}
      maxZoom={5}
      zoomSnap={0.1}
      zoomControl={false}
      attributionControl={false}
      worldCopyJump={false}
      className="h-full w-full"
      style={{ background: 'transparent' }}
    >
      <FitWorld />
      <GeoJSON
        // ключ заставляет перерисовать стили при изменении прогресса
        key={`${selectedIso ?? 'none'}`}
        data={world}
        style={styleFor}
        onEachFeature={onEachCountry}
      />
    </MapContainer>
  )
}
