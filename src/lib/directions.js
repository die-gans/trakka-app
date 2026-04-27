const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const CACHE = new Map()

/**
 * Fetch driving directions from Mapbox Directions API v5.
 * @param {Array<{name: string, lat: number, lng: number}>} waypoints
 * @returns {Promise<{geometry: GeoJSON.LineString, legs: Array<{summary: string, distance: number, duration: number, steps: Array}>}, distanceMeters: number, durationSeconds: number} | null>}
 */
export async function fetchDirections(waypoints) {
  if (!TOKEN || !waypoints || waypoints.length < 2) return null

  const coordsKey = waypoints.map((w) => `${w.lng},${w.lat}`).join(';')
  if (CACHE.has(coordsKey)) return CACHE.get(coordsKey)

  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordsKey}.json`)
  url.searchParams.set('access_token', TOKEN)
  url.searchParams.set('geometries', 'geojson')
  url.searchParams.set('overview', 'full')
  url.searchParams.set('steps', 'true')

  try {
    const res = await fetch(url.toString())
    if (!res.ok) {
      console.warn('TRAKKA: Directions API error', res.status, await res.text())
      return null
    }
    const data = await res.json()
    const route = data.routes?.[0]
    if (!route) return null

    const result = {
      geometry: route.geometry,
      legs: route.legs.map((leg) => ({
        summary: leg.summary,
        distance: leg.distance,
        duration: leg.duration,
        steps: (leg.steps || []).map((step) => ({
          maneuver: step.maneuver,
          name: step.name,
          distance: step.distance,
          duration: step.duration,
        })),
      })),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    }

    CACHE.set(coordsKey, result)
    return result
  } catch (err) {
    console.warn('TRAKKA: Directions fetch failed', err)
    return null
  }
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 min'
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export function formatDistance(meters) {
  if (!meters || meters <= 0) return '0 km'
  const km = meters / 1000
  if (km >= 100) return `${Math.round(km)} km`
  if (km >= 10) return `${km.toFixed(1)} km`
  return `${km.toFixed(2)} km`
}
