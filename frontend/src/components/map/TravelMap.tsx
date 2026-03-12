import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, GeoJSON, useMap } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Share2, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Place } from '@/types'
import { Button } from '@/components/ui/button'
import { PlaceDetailPanel } from './PlaceDetailPanel'
import { useMediaBreakpoint } from '@/hooks/useMediaBreakpoint'
import 'leaflet/dist/leaflet.css'

// Type icons
const typeEmojis: Record<Place['type'], string> = {
  attraction: '🏛️',
  restaurant: '🍽️',
  hotel: '🏨',
  nature: '🌳',
  culture: '🎭',
  entertainment: '🎪',
}

// Marker size based on user rating
function getMarkerSize(place: Place): number {
  if (!place.userRating) return 40
  return 36 + place.userRating * 4 // 40..56
}

// Marker border color based on user rating
function getRatingColor(rating?: number): string {
  if (!rating) return 'border-gray-200'
  if (rating >= 4) return 'border-green-400'
  if (rating >= 3) return 'border-yellow-400'
  return 'border-orange-400'
}

function getRatingBg(rating?: number): string {
  if (!rating) return 'bg-white'
  if (rating >= 4) return 'bg-green-50'
  if (rating >= 3) return 'bg-yellow-50'
  return 'bg-orange-50'
}

// Create custom marker icon
function createMarkerIcon(place: Place) {
  const emoji = typeEmojis[place.type]
  const isSelected = place.selected
  const size = getMarkerSize(place)
  const ratingBorder = isSelected ? 'border-primary' : getRatingColor(place.userRating)
  const ratingBg = isSelected ? 'bg-primary' : getRatingBg(place.userRating)

  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div class="relative group cursor-pointer">
        <div style="width:${size}px;height:${size}px" class="rounded-full ${ratingBg} ${isSelected ? 'ring-2 ring-white' : ''}
          shadow-lg flex items-center justify-center text-lg border-2 ${ratingBorder}
          transition-transform hover:scale-110">
          ${emoji}
        </div>
        ${isSelected ? `
          <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        ` : ''}
        ${place.userRating ? `
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0 rounded bg-amber-400 text-white text-[9px] font-bold">
            ${place.userRating}
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

// Style for graph GeoJSON edges
function graphStyle(feature: GeoJSON.Feature | undefined) {
  if (!feature?.properties) return { color: '#6366f1', weight: 3, opacity: 0.6 }

  const type = feature.properties.type
  if (type === 'edge') {
    const dist = feature.properties.distance_m || 500
    // Short edges = green, long = red
    const ratio = Math.min(dist / 2000, 1)
    const r = Math.round(ratio * 255)
    const g = Math.round((1 - ratio) * 200)
    return { color: `rgb(${r},${g},80)`, weight: 3, opacity: 0.7 }
  }
  if (type === 'alternative') {
    return { color: '#a78bfa', weight: 2, opacity: 0.5, dashArray: '8 4' }
  }
  // node points — hide (rendered as markers)
  return { color: 'transparent', weight: 0, opacity: 0 }
}

// Map center updater component
function MapUpdater({ center, zoom, selectedPlace }: {
  center: [number, number]
  zoom: number
  selectedPlace: Place | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedPlace) {
      map.setView(selectedPlace.coordinates, 15, { animate: true, duration: 0.5 })
    } else {
      map.setView(center, zoom, { animate: true, duration: 0.5 })
    }
  }, [map, center, zoom, selectedPlace])

  return null
}

export function TravelMap() {
  const {
    places, mapCenter, mapZoom, selectedPlace, setSelectedPlace,
    routeGeoJSON, graphGeoJSON, buildingGraph, buildPlaceGraph,
    openModal,
  } = useApp()
  const breakpoint = useMediaBreakpoint()
  const selectedCount = places.filter(p => p.selected).length
  const ratedCount = places.filter(p => p.userRating && p.userRating > 0).length

  return (
    <div className="h-full w-full relative">
      {/* Map hint overlay */}
      <AnimatePresence>
        {places.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1000] flex items-center justify-center bg-background"
          >
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                Карта вашего путешествия
              </h3>
              <p className="text-text-secondary">
                Выберите чат из истории слева или напишите куда планируете поехать,
                и здесь появятся рекомендуемые места для посещения
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        style={{ background: 'var(--color-surface)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} zoom={mapZoom} selectedPlace={selectedPlace} />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={place.coordinates}
            icon={createMarkerIcon(place)}
            eventHandlers={{
              click: () => setSelectedPlace(place),
            }}
          />
        ))}

        {/* AI route GeoJSON */}
        {routeGeoJSON && (
          <GeoJSON
            key={`route-${JSON.stringify(routeGeoJSON).slice(0, 50)}`}
            data={routeGeoJSON as unknown as GeoJSON.GeoJsonObject}
            style={{
              color: '#6366f1',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}

        {/* Graph "паутинка" GeoJSON — only edges, no node markers */}
        {graphGeoJSON && (
          <GeoJSON
            key={`graph-${JSON.stringify(graphGeoJSON).slice(0, 50)}`}
            data={graphGeoJSON as unknown as GeoJSON.GeoJsonObject}
            filter={(feature) => feature.geometry?.type !== 'Point'}
            style={graphStyle}
            onEachFeature={(feature, layer) => {
              if (feature.properties?.type === 'edge') {
                const dist = Math.round(feature.properties.distance_m || 0)
                const from = feature.properties.from_name || ''
                const to = feature.properties.to_name || ''
                layer.bindTooltip(`${from} → ${to}: ${dist}м`, { sticky: true })
              }
            }}
          />
        )}
      </MapContainer>

      {/* Place detail panel — on mobile, rendered in MainLayout instead */}
      {breakpoint !== 'mobile' && (
        <AnimatePresence>
          {selectedPlace && (
            <PlaceDetailPanel
              place={selectedPlace}
              onClose={() => setSelectedPlace(null)}
              breakpoint={breakpoint}
            />
          )}
        </AnimatePresence>
      )}

      {/* Build graph button */}
      <AnimatePresence>
        {ratedCount >= 2 && !selectedPlace && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-4 right-4 z-[1000]"
          >
            <Button
              onClick={buildPlaceGraph}
              disabled={buildingGraph}
              className="shadow-lg gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              {buildingGraph ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {buildingGraph ? 'Строим...' : `Построить паутинку (${ratedCount})`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected places count */}
      <AnimatePresence>
        {selectedCount > 0 && !selectedPlace && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 z-[1000] bg-primary text-white rounded-lg p-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Выбрано мест: {selectedCount}
              </span>
              <Button size="sm" variant="secondary" onClick={() => openModal('save-route')}>
                Сохранить маршрут
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
