import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import { latLngBounds, type Layer, type PathOptions } from 'leaflet'
import type { Feature, Geometry } from 'geojson'
import { Loader2 } from 'lucide-react'
import type { GameCountry } from '@/mocks/game'
import 'leaflet/dist/leaflet.css'

interface RegionProps {
  id: string
  country: string
  name: string
}

type RegionCollection = {
  type: 'FeatureCollection'
  features: Feature<Geometry, RegionProps>[]
}

interface CountryMapProps {
  country: GameCountry
  /** Регионы, где у пользователя есть закрытые точки */
  visitedRegionNames: string[]
}

/** Границы страны по её городам, чтобы карта открылась на нужном месте */
function FitCountry({ country }: { country: GameCountry }) {
  const map = useMap()
  const done = useRef('')

  useEffect(() => {
    if (done.current === country.iso) return
    done.current = country.iso
    if (country.cities.length === 0) return
    const bounds = latLngBounds(country.cities.map((c) => c.coordinates))
    map.fitBounds(bounds.pad(1.2), { animate: false })
  }, [country, map])

  return null
}

export function CountryMap({ country, visitedRegionNames }: CountryMapProps) {
  const [data, setData] = useState<RegionCollection | null>(null)

  // Границы регионов весят почти мегабайт: грузим их только когда открыли страну
  useEffect(() => {
    let alive = true
    import('@/data/world-regions.json')
      .then((m) => {
        if (alive) setData(m.default as unknown as RegionCollection)
      })
      .catch(() => setData(null))
    return () => {
      alive = false
    }
  }, [])

  const regions = useMemo(() => {
    if (!data) return null
    return {
      type: 'FeatureCollection' as const,
      features: data.features.filter((f) => f.properties.country === country.iso),
    }
  }, [data, country.iso])

  const visited = useMemo(() => new Set(visitedRegionNames), [visitedRegionNames])

  const styleFor = useMemo(
    () =>
      (feature?: Feature<Geometry, RegionProps>): PathOptions => {
        const name = feature?.properties?.name ?? ''
        const isVisited = visited.has(name)

        if (!isVisited) {
          return {
            fillColor: '#332B57',
            fillOpacity: 0.8,
            color: '#4A3F7A',
            weight: 0.7,
            opacity: 0.9,
          }
        }
        return {
          fillColor: '#3BA8B8',
          fillOpacity: 0.62,
          color: '#7ED3E0',
          weight: 1.2,
          opacity: 1,
        }
      },
    [visited]
  )

  const onEach = useMemo(
    () => (feature: Feature<Geometry, RegionProps>, layer: Layer) => {
      const name = feature.properties.name
      layer.bindTooltip(visited.has(name) ? name : `${name}: белое пятно`, {
        direction: 'top',
        className: 'crista-map-tip',
        sticky: true,
      })
    },
    [visited]
  )

  if (!regions) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="font-sans text-sm">Загружаем регионы</span>
      </div>
    )
  }

  if (regions.features.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="font-sans text-sm text-text-muted">
          Для страны {country.name} регионы пока не размечены
        </p>
      </div>
    )
  }

  return (
    <MapContainer
      center={country.cities[0]?.coordinates ?? [50, 10]}
      zoom={4}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: 'transparent' }}
    >
      <FitCountry country={country} />
      <GeoJSON key={country.iso} data={regions} style={styleFor} onEachFeature={onEach} />
    </MapContainer>
  )
}
