import type { Place } from '@/types'

// Граф через nginx: /graph-api/ → placesweb (без отдельного порта на хост)
const GRAPH_API_URL =
  import.meta.env.VITE_GRAPH_API_URL || 'http://localhost:3333/graph-api'

export interface GraphBuildResult {
  graph_id: string
  geojson: Record<string, unknown>
  build_time_seconds: number
  nodes: unknown[]
  edges: unknown[]
  metrics: Record<string, unknown>
  alternatives?: unknown[]
}

/** Build a place graph ("паутинка") from rated places */
export async function buildGraph(places: Place[]): Promise<GraphBuildResult> {
  const points = places.map(p => ({
    lat: p.coordinates[0],
    lon: p.coordinates[1],
    weight: p.userRating ?? (p.rating || 1.0),
    name: p.name,
  }))

  const response = await fetch(`${GRAPH_API_URL}/api/v1/graph/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      points,
      use_osrm_scoring: true,
      k_alternatives: 2,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => `HTTP ${response.status}`)
    throw new Error(`Graph build failed: ${detail}`)
  }

  return response.json()
}
