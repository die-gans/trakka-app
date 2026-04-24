import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { SectionTitle } from './ui/SectionTitle'

const BASECAMP_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px; border-radius: 50%;
    background: #3b82f6; border: 3px solid #1e3a5f;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

const FAMILY_ICONS = {
  SYD: L.divIcon({
    className: '',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: #10b981; border: 2px solid #064e3b;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 10px; font-weight: 900; color: white;
    ">S</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  }),
  MEL: L.divIcon({
    className: '',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: #f59e0b; border: 2px solid #78350f;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 10px; font-weight: 900; color: white;
    ">M</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  }),
  CBR: L.divIcon({
    className: '',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: #8b5cf6; border: 2px solid #4c1d95;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 10px; font-weight: 900; color: white;
    ">C</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  }),
}

export function MapView({ tripMeta, families }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    })

    // Dark-themed tiles — CartoDB Dark Matter (free, no key)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map)

    // Add basecamp marker
    const { lat, lng } = tripMeta.basecampCoordinates
    L.marker([lat, lng], { icon: BASECAMP_ICON })
      .addTo(map)
      .bindPopup(`<b>${tripMeta.basecampAddress}</b><br/>Basecamp`)

    // Add family origin markers
    const bounds = L.latLngBounds([[lat, lng]])

    families.forEach((family) => {
      const coords = family.originCoordinates || family.origin_lat && { lat: family.origin_lat, lng: family.origin_lng }
      if (!coords) return

      const short = family.shortOrigin || family.short_origin
      const icon = FAMILY_ICONS[short] || FAMILY_ICONS.SYD

      L.marker([coords.lat, coords.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${family.name}</b><br/>${family.origin || family.origin}<br/>${family.drive_time || family.driveTime || ''} · ${family.eta || ''}`)

      bounds.extend([coords.lat, coords.lng])
    })

    // Fit bounds with padding
    map.fitBounds(bounds, { padding: [60, 60] })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [tripMeta, families])

  return (
    <div className="flex h-full flex-col">
      <div className="p-6 pb-2">
        <SectionTitle eyebrow="Terrain" title="Convoy Map" meta={`${families.length + 1} markers`} />
      </div>
      <div className="flex-1 px-6 pb-6">
        <div
          ref={mapRef}
          className="h-full w-full border border-border-default"
          style={{ background: '#0a0a0a' }}
        />
      </div>
      <div className="px-6 pb-4">
        <div className="flex gap-3 text-[10px] text-text-secondary">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#3b82f6] border border-[#1e3a5f]" />
            Basecamp
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#10b981] border border-[#064e3b]" />
            Sydney Crew
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#f59e0b] border border-[#78350f]" />
            Melbourne Crew
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#8b5cf6] border border-[#4c1d95]" />
            Canberra Crew
          </div>
        </div>
      </div>
    </div>
  )
}
