import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { SectionTitle } from './ui/SectionTitle'
import { Play, Pause } from 'lucide-react'

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const COLORS = {
  info: '#58A6FF',
  warning: '#D29922',
  success: '#3FB950',
  critical: '#F85149',
  violet: '#A371F7',
}

const TONE_MAP = {
  info: COLORS.info,
  warning: COLORS.warning,
  success: COLORS.success,
  critical: COLORS.critical,
}

function createMarkerElement(html) {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

function createBasecampMarker() {
  return createMarkerElement(
    `<div style="width:28px;height:28px;border-radius:50%;background:${COLORS.info};border:3px solid rgba(10,12,16,0.8);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>`
  )
}

function createFamilyMarker(short, color) {
  return createMarkerElement(
    `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:2px solid rgba(10,12,16,0.8);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:10px;font-weight:900;color:white;font-family:var(--font-mono),monospace;cursor:pointer;">${short}</div>`
  )
}

function createLocationMarker(category) {
  const color =
    category === 'meal'
      ? COLORS.warning
      : category === 'activity'
        ? COLORS.success
        : category === 'stay'
          ? COLORS.info
          : COLORS.violet
  return createMarkerElement(
    `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid rgba(10,12,16,0.8);box-shadow:0 1px 4px rgba(0,0,0,0.4);cursor:pointer;"></div>`
  )
}

function createConvoyMarker(color) {
  return createMarkerElement(
    `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 10px ${color},0 0 4px rgba(0,0,0,0.5);"></div>`
  )
}

function haversine(a, b) {
  const R = 6371e3
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
      )
    )
  )
}

function getPathDistances(path) {
  const distances = [0]
  let total = 0
  for (let i = 1; i < path.length; i++) {
    total += haversine(path[i - 1], path[i])
    distances.push(total)
  }
  return { distances, total }
}

function interpolateAlongPath(path, distances, total, progress) {
  if (progress >= 1) return path[path.length - 1]
  const target = progress * total
  let i = 1
  while (i < distances.length && distances[i] < target) i++
  if (i >= path.length) return path[path.length - 1]
  const segStart = distances[i - 1]
  const segEnd = distances[i]
  const segLen = segEnd - segStart
  const segProgress = segLen > 0 ? (target - segStart) / segLen : 0
  return {
    lat: path[i - 1].lat + (path[i].lat - path[i - 1].lat) * segProgress,
    lng: path[i - 1].lng + (path[i].lng - path[i - 1].lng) * segProgress,
  }
}

function getCoords(item) {
  if (item?.coordinates) return item.coordinates
  if (item?.lat != null && item?.lng != null) return { lat: item.lat, lng: item.lng }
  if (item?.originCoordinates) return item.originCoordinates
  if (item?.origin_lat != null && item?.origin_lng != null)
    return { lat: item.origin_lat, lng: item.origin_lng }
  return null
}

export function MapView({ tripMeta, families = [], locations = [], routes = [] }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const convoyMarkersRef = useRef([])
  const animFrameRef = useRef(null)
  const routeAnimDataRef = useRef([])
  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize map and all data layers
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return

    try {
      // Mapbox GL JS requires a public token (pk.xxxx). 
      // If a secret token (sk.xxxx) is provided, initialization may fail.
      mapboxgl.accessToken = TOKEN
      
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [150.7, -35.13],
        zoom: 6,
        attributionControl: false,
      })

      mapRef.current = map
    } catch (err) {
      console.error('TRAKKA: Failed to initialize Mapbox GL:', err)
      return
    }

    const map = mapRef.current
    if (!map) return

    map.on('load', () => {
      // ── Route lines ──
      const routeFeatures = (routes || []).map((r) => ({
        type: 'Feature',
        properties: {
          tone: r.tone || 'info',
          familyId: r.family_id || r.familyId,
        },
        geometry: {
          type: 'LineString',
          coordinates: (r.path || []).map((p) => [p.lng, p.lat]),
        },
      }))

      map.addSource('routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: routeFeatures },
      })

      map.addLayer({
        id: 'routes',
        type: 'line',
        source: 'routes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': [
            'match',
            ['get', 'tone'],
            'info',
            COLORS.info,
            'warning',
            COLORS.warning,
            'success',
            COLORS.success,
            'critical',
            COLORS.critical,
            COLORS.info,
          ],
          'line-width': 2,
          'line-opacity': 0.8,
        },
      })

      // ── Bounds accumulator ──
      const bounds = new mapboxgl.LngLatBounds()

      // ── Basecamp ──
      const base = getCoords(tripMeta) || tripMeta?.basecampCoordinates
      if (base?.lat != null && base?.lng != null) {
        const popup = new mapboxgl.Popup({ offset: 14 }).setHTML(
          `<div style="font-family:var(--font-sans),sans-serif;font-size:11px;color:#C9D1D9;">
            <div style="font-weight:900;text-transform:uppercase;letter-spacing:0.08em;">${tripMeta?.basecampAddress || 'Basecamp'}</div>
            <div style="color:#8B949E;margin-top:2px;">Basecamp</div>
          </div>`
        )
        const marker = new mapboxgl.Marker({ element: createBasecampMarker() })
          .setLngLat([base.lng, base.lat])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
        bounds.extend([base.lng, base.lat])
      }

      // ── Family origins ──
      const familyColors = [
        COLORS.success,
        COLORS.warning,
        COLORS.violet,
        COLORS.info,
        COLORS.critical,
      ]
      ;(families || []).forEach((family, idx) => {
        const coords = getCoords(family)
        if (!coords) return
        const short =
          family.shortOrigin || family.short_origin || String(idx + 1)
        const color = familyColors[idx % familyColors.length]
        const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
          `<div style="font-family:var(--font-sans),sans-serif;font-size:11px;color:#C9D1D9;">
            <div style="font-weight:900;text-transform:uppercase;letter-spacing:0.08em;">${family.name || 'Family'}</div>
            <div style="color:#8B949E;margin-top:2px;">${family.origin || ''}${family.drive_time || family.driveTime ? ' · ' + (family.drive_time || family.driveTime) : ''}${family.eta ? ' · ETA ' + family.eta : ''}</div>
          </div>`
        )
        const marker = new mapboxgl.Marker({
          element: createFamilyMarker(short, color),
        })
          .setLngLat([coords.lng, coords.lat])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
        bounds.extend([coords.lng, coords.lat])
      })

      // ── Locations ──
      ;(locations || []).forEach((loc) => {
        const coords = getCoords(loc)
        if (!coords) return
        const popup = new mapboxgl.Popup({ offset: 10 }).setHTML(
          `<div style="font-family:var(--font-sans),sans-serif;font-size:11px;color:#C9D1D9;">
            <div style="font-weight:900;text-transform:uppercase;letter-spacing:0.08em;">${loc.title || loc.name || 'Location'}</div>
            <div style="color:#8B949E;margin-top:2px;">${loc.address || ''}${loc.summary ? ' · ' + loc.summary : ''}</div>
          </div>`
        )
        const marker = new mapboxgl.Marker({
          element: createLocationMarker(loc.category),
        })
          .setLngLat([coords.lng, coords.lat])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(marker)
        bounds.extend([coords.lng, coords.lat])
      })

      // ── Route path points for bounds ──
      ;(routes || []).forEach((r) => {
        ;(r.path || []).forEach((p) => {
          if (p.lng != null && p.lat != null) bounds.extend([p.lng, p.lat])
        })
      })

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 800 })
      }

      // ── Precompute convoy animation data ──
      routeAnimDataRef.current = (routes || []).map((r) => {
        const path = r.path || []
        const { distances, total } = getPathDistances(path)
        return { path, distances, total }
      })

      // ── Create convoy markers (hidden initially) ──
      ;(routes || []).forEach((r) => {
        const color = TONE_MAP[r.tone] || COLORS.info
        const el = createConvoyMarker(color)
        el.style.display = 'none'
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([0, 0])
          .addTo(map)
        convoyMarkersRef.current.push(marker)
      })
    })

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      convoyMarkersRef.current.forEach((m) => m.remove())
      convoyMarkersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [tripMeta, families, locations, routes])

  // Convoy playback animation
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    const map = mapRef.current
    if (!map) return

    // Show markers and reset to route start
    convoyMarkersRef.current.forEach((marker, i) => {
      const data = routeAnimDataRef.current[i]
      const el = marker.getElement()
      if (!data || !data.path.length) {
        el.style.display = 'none'
        return
      }
      el.style.display = 'block'
      const start = data.path[0]
      marker.setLngLat([start.lng, start.lat])
    })

    const startTime = performance.now()
    const duration = 5000

    const animate = (now) => {
      const elapsed = now - startTime
      const p = Math.min(elapsed / duration, 1)

      convoyMarkersRef.current.forEach((marker, i) => {
        const data = routeAnimDataRef.current[i]
        if (!data || !data.path.length) return
        const pos = interpolateAlongPath(
          data.path,
          data.distances,
          data.total,
          p
        )
        marker.setLngLat([pos.lng, pos.lat])
      })

      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying])

  if (!TOKEN) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 border border-dashed border-border-default bg-bg-panel">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
          Mapbox token required
        </div>
        <div className="text-[11px] text-text-secondary">
          Add VITE_MAPBOX_ACCESS_TOKEN to your .env file
        </div>
      </div>
    )
  }

  const markerCount =
    (families?.length || 0) + 1 + (locations?.length || 0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-6 pb-2">
        <SectionTitle
          eyebrow="Terrain"
          title="Convoy Map"
          meta={`${markerCount} markers · ${routes?.length || 0} routes`}
        />
        {routes?.length > 0 && (
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-2 border border-border-default bg-bg-panel px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-text-primary transition-colors hover:border-info/40 hover:bg-bg-elevated/40"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'Pause' : 'Play Convoy'}
          </button>
        )}
      </div>
      <div className="flex-1 px-6 pb-4">
        <div
          ref={containerRef}
          className="h-full w-full border border-border-default"
          style={{ background: '#0a0a0a' }}
        />
      </div>
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-3 text-[10px] text-text-secondary">
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: COLORS.info,
                border: '2px solid rgba(10,12,16,0.8)',
              }}
            />
            Basecamp
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: COLORS.success,
                border: '2px solid rgba(10,12,16,0.8)',
              }}
            />
            Family Origin
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: COLORS.warning,
                border: '2px solid rgba(10,12,16,0.8)',
              }}
            />
            Meal
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: COLORS.violet,
                border: '2px solid rgba(10,12,16,0.8)',
              }}
            />
            Waypoint
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4" style={{ background: COLORS.info }} />
            Route
          </div>
        </div>
      </div>
    </div>
  )
}
