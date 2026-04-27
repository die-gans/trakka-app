const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const CACHE = new Map()

/**
 * Geocode an address using Mapbox Geocoding API.
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number, placeName: string} | null>}
 */
export async function geocodeAddress(address) {
  if (!TOKEN || !address?.trim()) return null

  const key = address.trim().toLowerCase()
  if (CACHE.has(key)) return CACHE.get(key)

  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`)
  url.searchParams.set('access_token', TOKEN)
  url.searchParams.set('limit', '1')
  url.searchParams.set('types', 'place,address,locality,neighborhood,poi')

  try {
    const res = await fetch(url.toString())
    if (!res.ok) {
      console.warn('TRAKKA: Geocoding API error', res.status)
      return null
    }
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null

    const [lng, lat] = feature.center
    const result = {
      lat,
      lng,
      placeName: feature.place_name,
    }
    CACHE.set(key, result)
    return result
  } catch (err) {
    console.warn('TRAKKA: Geocoding fetch failed', err)
    return null
  }
}

/**
 * Search for place suggestions using Mapbox Geocoding API with autocomplete.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array<{id: string, placeName: string, lat: number, lng: number}>>}
 */
export async function searchPlaces(query, limit = 5) {
  if (!TOKEN || !query?.trim()) return []

  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
  url.searchParams.set('access_token', TOKEN)
  url.searchParams.set('autocomplete', 'true')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('types', 'place,address,locality,neighborhood,poi')
  url.searchParams.set('country', 'au')

  try {
    const res = await fetch(url.toString())
    if (!res.ok) {
      console.warn('TRAKKA: Geocoding search error', res.status)
      return []
    }
    const data = await res.json()
    return (data.features || []).map((f) => ({
      id: f.id,
      placeName: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
    }))
  } catch (err) {
    console.warn('TRAKKA: Geocoding search failed', err)
    return []
  }
}
