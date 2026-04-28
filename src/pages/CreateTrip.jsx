import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, MapPin, Route } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createTrip, createRoute } from '../lib/supabase-crud'
import { supabase } from '../lib/supabase'
import { searchPlaces, reverseGeocode } from '../lib/geocoding'
import { fetchDirections } from '../lib/directions'
import { cn } from '../lib/utils'

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

function MiniMap({ waypoints = [], onMapClick, interactive = false }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return

    try {
      mapboxgl.accessToken = TOKEN
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: waypoints.length > 0 && waypoints[0].lng != null ? [waypoints[0].lng, waypoints[0].lat] : [133.7751, -25.2744],
        zoom: waypoints.length > 0 && waypoints[0].lng != null ? 12 : 3,
        attributionControl: false,
        interactive: interactive || !!onMapClick,
      })

      if (onMapClick) {
        mapRef.current.on('click', (e) => {
          onMapClick(e.lngLat.lng, e.lngLat.lat)
        })
        mapRef.current.getCanvas().style.cursor = 'pointer'
      }

      mapRef.current.on('load', () => {
        mapRef.current?.resize()
        setTimeout(() => mapRef.current?.resize(), 100)
      })

      const observer = new ResizeObserver(() => {
        mapRef.current?.resize()
      })
      observer.observe(containerRef.current)

      return () => {
        observer.disconnect()
        mapRef.current?.remove()
        mapRef.current = null
      }
    } catch (err) {
      console.error('Failed to initialize map', err)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (waypoints.length === 0) return

    const bounds = new mapboxgl.LngLatBounds()

    waypoints.forEach((wp) => {
      if (wp.lng == null || wp.lat == null) return
      
      const el = document.createElement('div')
      el.style.width = wp.isBasecamp ? '16px' : '12px'
      el.style.height = wp.isBasecamp ? '16px' : '12px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = wp.color || '#58A6FF'
      el.style.border = '2px solid rgba(10,12,16,0.8)'
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.5)'

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([wp.lng, wp.lat])
        .addTo(map)

      markersRef.current.push(marker)
      bounds.extend([wp.lng, wp.lat])
    })

    if (waypoints.length > 1) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 12 })
    } else if (waypoints.length === 1 && waypoints[0].lng != null && waypoints[0].lat != null) {
      map.flyTo({ center: [waypoints[0].lng, waypoints[0].lat], zoom: 12 })
    }
  }, [waypoints])

  return (
    <div className="h-48 w-full border border-border-default bg-bg-panel relative overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      {!TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-text-secondary bg-bg-base/80">
          Mapbox token missing
        </div>
      )}
    </div>
  )
}

const DEFAULT_FAMILY = {
  name: '',
  shortOrigin: '',
  origin: '',
  originLat: null,
  originLng: null,
  headcount: '',
  vehicle: '',
  responsibility: '',
}

const DEFAULT_STOP = {
  name: '',
  address: '',
  lat: null,
  lng: null,
}

/* ─── Place Autocomplete ─── */
function PlaceAutocomplete({ value, onSelect, placeholder, disabled }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef(null)
  const blurTimeout = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => setQuery(value || ''))
  }, [value])

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      requestAnimationFrame(() => setSuggestions([]))
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const results = await searchPlaces(query)
      setSuggestions(results)
      setOpen(results.length > 0)
      setHighlighted(-1)
      setLoading(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (place) => {
    setQuery(place.placeName)
    setOpen(false)
    onSelect?.(place)
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0) {
        handleSelect(suggestions[highlighted])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setOpen(false), 150)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info disabled:opacity-40"
      />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border-default border-t-info" />
        </div>
      )}
      {open && (
        <div
          className="absolute z-50 mt-0.5 w-full border border-border-default bg-bg-surface shadow-lg"
          onMouseDown={(e) => { e.preventDefault(); clearTimeout(blurTimeout.current) }}
        >
          {suggestions.map((place, idx) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelect(place)}
              className={cn(
                'flex w-full items-start gap-2 px-3 py-2 text-left transition-colors',
                idx === highlighted ? 'bg-info-soft' : 'hover:bg-bg-panel'
              )}
              onMouseEnter={() => setHighlighted(idx)}
            >
              <MapPin size={13} className="mt-0.5 shrink-0 text-info" />
              <div className="min-w-0">
                <div className="truncate text-[11px] text-text-primary">{place.placeName}</div>
                <div className="text-[9px] text-text-secondary">
                  {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CreateTrip() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  // Trip basics
  const [title, setTitle] = useState('')
  const [commandName, setCommandName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [basecampAddress, setBasecampAddress] = useState('')
  const [basecampCoords, setBasecampCoords] = useState(null)

  // Families
  const [families, setFamilies] = useState([{ ...DEFAULT_FAMILY }])

  // Routes / waypoints per family
  // routes[i] = { stops: [{name, address, lat, lng}, ...] }
  // stops[0] = origin, stops[last] = basecamp
  const [routePlans, setRoutePlans] = useState([{ stops: [] }])

  const addFamily = () => {
    setFamilies((prev) => [...prev, { ...DEFAULT_FAMILY }])
    setRoutePlans((prev) => [...prev, { stops: [] }])
  }

  const removeFamily = (index) => {
    setFamilies((prev) => prev.filter((_, i) => i !== index))
    setRoutePlans((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFamily = (index, field, value) => {
    setFamilies((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    )
  }

  const addStop = (familyIndex) => {
    setRoutePlans((prev) =>
      prev.map((rp, i) =>
        i === familyIndex
          ? { stops: [...rp.stops, { ...DEFAULT_STOP }] }
          : rp
      )
    )
  }

  const removeStop = (familyIndex, stopIndex) => {
    setRoutePlans((prev) =>
      prev.map((rp, i) =>
        i === familyIndex
          ? { stops: rp.stops.filter((_, si) => si !== stopIndex) }
          : rp
      )
    )
  }

  const updateStop = (familyIndex, stopIndex, field, value) => {
    setRoutePlans((prev) =>
      prev.map((rp, i) =>
        i === familyIndex
          ? {
              stops: rp.stops.map((s, si) =>
                si === stopIndex ? { ...s, [field]: value } : s
              ),
            }
          : rp
      )
    )
  }

  const buildWaypointsForFamily = (familyIndex) => {
    const family = families[familyIndex]
    const plan = routePlans[familyIndex]
    const waypoints = []

    if (family.originLat != null && family.originLng != null) {
      waypoints.push({
        name: family.origin || 'Origin',
        lat: family.originLat,
        lng: family.originLng,
      })
    }

    for (const stop of plan?.stops || []) {
      if (stop.lat != null && stop.lng != null) {
        waypoints.push({
          name: stop.name || 'Stop',
          lat: stop.lat,
          lng: stop.lng,
        })
      }
    }

    if (basecampCoords) {
      waypoints.push({
        name: 'Basecamp',
        lat: basecampCoords.lat,
        lng: basecampCoords.lng,
      })
    }

    return waypoints
  }

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) return
    setSaving(true)

    try {
      const trip = await createTrip({
        title,
        command_name: commandName || title,
        start_date: startDate,
        end_date: endDate,
        basecamp_address: basecampAddress,
        basecamp_lat: basecampCoords?.lat ?? null,
        basecamp_lng: basecampCoords?.lng ?? null,
      })

      // Create families
      const createdFamilies = []
      for (const family of families.filter((f) => f.name.trim())) {
        const payload = {
          trip_id: trip.id,
          name: family.name,
          short_origin: family.shortOrigin || null,
          origin: family.origin || null,
          origin_lat: family.originLat ?? null,
          origin_lng: family.originLng ?? null,
          headcount: family.headcount || null,
          vehicle: family.vehicle || null,
          responsibility: family.responsibility || null,
          status: 'Transit',
        }
        
        const { data: famData, error: famError } = await supabase
          .from('families')
          .insert(payload)
          .select()
          .single()

        if (famError) {
          console.error('Family insert error:', famError, payload)
          throw new Error(`Failed to insert family ${family.name}: ${famError.message || famError.details || JSON.stringify(famError)}`)
        }

        createdFamilies.push({ ...family, id: famData.id })
      }

      // Create routes for each family
      for (let i = 0; i < createdFamilies.length; i++) {
        try {
          const family = createdFamilies[i]
          const waypoints = buildWaypointsForFamily(i)
          if (waypoints.length < 2) continue

          const dir = await fetchDirections(waypoints)

          await createRoute({
            trip_id: trip.id,
            family_id: family.id,
            title: `${family.shortOrigin || family.origin} → Basecamp`,
            focus_day: 'thu',
            tone: i === 0 ? 'info' : i === 1 ? 'warning' : 'success',
            path: waypoints,
            duration_seconds: dir?.durationSeconds != null ? Math.round(dir.durationSeconds) : null,
            distance_meters: dir?.distanceMeters != null ? Math.round(dir.distanceMeters) : null,
          })
        } catch (routeErr) {
          console.warn('Failed to create route for family:', routeErr)
        }
      }

      navigate(`/trips/${trip.id}`)
    } catch (err) {
      console.error('Failed to create trip:', err)
      alert('Failed to create trip: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const validFamilies = families.filter((f) => f.name.trim())
  const allFamiliesGeocoded = validFamilies.length > 0 && validFamilies.every((f) => f.originLat != null && f.originLng != null)
  const basecampGeocoded = basecampCoords != null
  const allStopsGeocoded = routePlans.every(plan => (plan.stops || []).every(stop => stop.lat != null && stop.lng != null))
  
  const canSubmit = title && startDate && endDate && basecampGeocoded && allFamiliesGeocoded && allStopsGeocoded

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      {/* Left rail */}
      <div className="flex w-64 flex-col border-r border-border-default bg-bg-panel">
        <div className="flex h-14 items-center border-b border-border-default px-6">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 text-[11px] font-bold text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            Back to Ops
          </button>
        </div>
        <div className="flex-1 p-4">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-info mb-4">
            New Operation
          </div>
          <StepIndicator number={1} label="Trip Details" active={step >= 1} />
          <StepIndicator number={2} label="Family Units" active={step >= 2} />
          <StepIndicator number={3} label="Route Planning" active={step >= 3} />
          <StepIndicator number={4} label="Review & Launch" active={step >= 4} />
        </div>
      </div>

      {/* Main form */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-border-default bg-bg-surface px-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-success">
            UNCLASSIFIED // TRAKKA OPS
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-2xl">
            {/* Step 1: Trip Details */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Step 1
                  </div>
                  <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Trip Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <Field label="Trip Name" required>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Jervis Bay Long Weekend"
                      className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                    />
                  </Field>

                  <Field label="Command Centre Name">
                    <input
                      type="text"
                      value={commandName}
                      onChange={(e) => setCommandName(e.target.value)}
                      placeholder="e.g. Jervis Bay Command Centre"
                      className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Start Date" required>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                      />
                    </Field>
                    <Field label="End Date" required>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                      />
                    </Field>
                  </div>

                  <Field label="Basecamp Address" required>
                    <PlaceAutocomplete
                      value={basecampAddress}
                      placeholder="e.g. Jervis Bay, NSW 2540"
                      onSelect={(place) => {
                        setBasecampAddress(place.placeName)
                        setBasecampCoords({ lat: place.lat, lng: place.lng })
                      }}
                    />
                    {basecampAddress && !basecampCoords && (
                      <div className="mt-1.5 text-[10px] text-critical">
                        ⚠️ Please select a valid location from the dropdown or click on the map.
                      </div>
                    )}
                    {basecampCoords && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-success">
                        <MapPin size={11} />
                        <span>
                          {basecampCoords.lat.toFixed(4)}, {basecampCoords.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </Field>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    Select Basecamp on Map
                  </div>
                  <MiniMap 
                    waypoints={basecampCoords ? [{ lat: basecampCoords.lat, lng: basecampCoords.lng, color: '#3FB950', isBasecamp: true }] : []}
                    onMapClick={async (lng, lat) => {
                      setBasecampCoords({ lat, lng })
                      const res = await reverseGeocode(lng, lat)
                      if (res) {
                        setBasecampAddress(res.placeName)
                      }
                    }}
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!title || !startDate || !endDate || !basecampCoords}
                    className={cn(
                      'border px-6 py-2 text-[11px] font-black uppercase tracking-wider',
                      title && startDate && endDate && basecampCoords
                        ? 'border-info bg-info-soft text-info hover:bg-info/20'
                        : 'border-border-default bg-bg-panel text-text-muted cursor-not-allowed'
                    )}
                  >
                    Next: Family Units
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Family Units */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Step 2
                  </div>
                  <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Family Units
                  </h2>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Add the crews rolling out on this trip.
                  </p>
                </div>

                <div className="space-y-3">
                  {families.map((family, index) => (
                    <div key={index} className="border border-border-default bg-bg-surface p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          Unit {index + 1}
                        </div>
                        {families.length > 1 && (
                          <button
                            onClick={() => removeFamily(index)}
                            className="text-text-secondary hover:text-critical"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={family.name}
                          onChange={(e) => updateFamily(index, 'name', e.target.value)}
                          placeholder="Family name (e.g. The Morrisons)"
                          className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={family.shortOrigin}
                            onChange={(e) => updateFamily(index, 'shortOrigin', e.target.value)}
                            placeholder="Origin code (e.g. SYD)"
                            className="border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                          />
                          <PlaceAutocomplete
                            value={family.origin}
                            placeholder="Origin city *"
                            onSelect={(place) => {
                              updateFamily(index, 'origin', place.placeName)
                              updateFamily(index, 'originLat', place.lat)
                              updateFamily(index, 'originLng', place.lng)
                            }}
                          />
                        </div>
                        {family.origin && family.originLat == null && (
                          <div className="text-[10px] text-critical mt-1">
                            ⚠️ Please select a valid location from the dropdown or click on the map.
                          </div>
                        )}
                        {family.originLat != null && (
                          <div className="flex items-center gap-1.5 text-[10px] text-success">
                            <MapPin size={11} />
                            <span>
                              {family.originLat.toFixed(4)}, {family.originLng.toFixed(4)}
                            </span>
                          </div>
                        )}
                        <div className="mt-2">
                          <MiniMap 
                            waypoints={family.originLat ? [{ lat: family.originLat, lng: family.originLng, color: '#58A6FF' }] : []}
                            onMapClick={async (lng, lat) => {
                              updateFamily(index, 'originLat', lat)
                              updateFamily(index, 'originLng', lng)
                              const res = await reverseGeocode(lng, lat)
                              if (res) {
                                updateFamily(index, 'origin', res.placeName)
                              }
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={family.headcount}
                            onChange={(e) => updateFamily(index, 'headcount', e.target.value)}
                            placeholder="Headcount"
                            className="border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                          />
                          <input
                            type="text"
                            value={family.vehicle}
                            onChange={(e) => updateFamily(index, 'vehicle', e.target.value)}
                            placeholder="Vehicle"
                            className="border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                          />
                        </div>
                        <input
                          type="text"
                          value={family.responsibility}
                          onChange={(e) => updateFamily(index, 'responsibility', e.target.value)}
                          placeholder="Responsibility"
                          className="w-full border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addFamily}
                  className="mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-border-default bg-bg-surface py-3 text-[11px] font-bold text-text-secondary transition-colors hover:border-info/50 hover:text-info"
                >
                  <Plus size={14} />
                  Add Another Unit
                </button>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-border-default bg-bg-panel px-6 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!allFamiliesGeocoded}
                    className={cn(
                      'border px-6 py-2 text-[11px] font-black uppercase tracking-wider',
                      allFamiliesGeocoded
                        ? 'border-info bg-info-soft text-info hover:bg-info/20'
                        : 'border-border-default bg-bg-panel text-text-muted cursor-not-allowed'
                    )}
                  >
                    Next: Route Planning
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Route Planning */}
            {step === 3 && (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Step 3
                  </div>
                  <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Route Planning
                  </h2>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    Plan the driving route for each unit. Origin and basecamp are locked in — add stops in between.
                  </p>
                </div>

                {!basecampGeocoded && (
                  <div className="mb-4 border border-warning/30 bg-warning-soft p-3 text-[11px] text-warning">
                    Basecamp address needs to be geocoded before route planning. Go back to Step 1 and click "Lookup".
                  </div>
                )}

                {validFamilies.map((family, familyIndex) => {
                  const waypoints = buildWaypointsForFamily(familyIndex)
                  const originOk = family.originLat != null

                  return (
                    <div key={familyIndex} className="border border-border-default bg-bg-surface p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Route size={14} className="text-info" />
                        <div className="text-[11px] font-black uppercase tracking-wider text-text-primary">
                          {family.name}
                        </div>
                        <span className="text-[10px] text-text-secondary">
                          {family.shortOrigin || family.origin}
                        </span>
                      </div>

                      {!originOk && (
                        <div className="mb-3 text-[10px] text-warning">
                          Origin not geocoded. Go back to Step 2 and verify the origin city.
                        </div>
                      )}

                      {/* Waypoint timeline */}
                      <div className="space-y-2">
                        {waypoints.map((wp, wpIdx) => {
                          const isOrigin = wpIdx === 0
                          const isBasecamp = wpIdx === waypoints.length - 1 && waypoints.length > 1
                          return (
                            <div key={wpIdx} className="flex items-center gap-3 border border-border-default bg-bg-panel px-3 py-2">
                              <div className={cn(
                                'h-2.5 w-2.5 rounded-full border-2 shrink-0',
                                isOrigin ? 'border-success bg-success-soft' : isBasecamp ? 'border-info bg-info-soft' : 'border-warning bg-warning-soft'
                              )} />
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold text-text-primary truncate">{wp.name}</div>
                                <div className="text-[10px] text-text-secondary">
                                  {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                                </div>
                              </div>
                              <div className="text-[9px] font-black uppercase tracking-wider text-text-muted shrink-0">
                                {isOrigin ? 'Origin' : isBasecamp ? 'Basecamp' : `Stop ${wpIdx}`}
                              </div>
                            </div>
                          )
                        })}

                        {/* Intermediate stops editor */}
                        {routePlans[familyIndex]?.stops?.map((stop, stopIdx) => (
                          <div key={`stop-${stopIdx}`} className="flex items-start gap-2 border border-border-default bg-bg-panel px-3 py-2">
                            <div className="h-2.5 w-2.5 rounded-full border-2 border-warning bg-warning-soft shrink-0 mt-1" />
                            <div className="min-w-0 flex-1 space-y-2">
                              <input
                                type="text"
                                value={stop.name}
                                onChange={(e) => updateStop(familyIndex, stopIdx, 'name', e.target.value)}
                                placeholder="Stop name"
                                className="w-full border border-border-default bg-bg-base px-2 py-1 text-[11px] text-text-primary outline-none focus:border-info"
                              />
                              <PlaceAutocomplete
                                value={stop.address}
                                placeholder="Address"
                                onSelect={(place) => {
                                  updateStop(familyIndex, stopIdx, 'address', place.placeName)
                                  updateStop(familyIndex, stopIdx, 'lat', place.lat)
                                  updateStop(familyIndex, stopIdx, 'lng', place.lng)
                                  if (!stop.name) {
                                    updateStop(familyIndex, stopIdx, 'name', place.placeName.split(',')[0])
                                  }
                                }}
                              />
                              {stop.address && stop.lat == null && (
                                <div className="text-[10px] text-critical mt-1">
                                  ⚠️ Please select a valid location from the dropdown or click on the map.
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStop(familyIndex, stopIdx)}
                              className="text-text-secondary hover:text-critical shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addStop(familyIndex)}
                        disabled={!originOk || !basecampGeocoded}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 border border-dashed border-border-default bg-bg-panel py-2 text-[10px] font-bold text-text-secondary transition-colors hover:border-info/50 hover:text-info disabled:opacity-40"
                      >
                        <Plus size={11} />
                        Add Stop
                      </button>

                      {originOk && basecampGeocoded && (
                        <div className="mt-4">
                          <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-text-secondary">
                            Click Map to Add Stop
                          </div>
                          <MiniMap 
                            waypoints={waypoints.map((wp, i) => ({
                              ...wp,
                              color: i === 0 ? '#3FB950' : i === waypoints.length - 1 ? '#58A6FF' : '#D29922',
                              isBasecamp: i === waypoints.length - 1
                            }))} 
                            onMapClick={async (lng, lat) => {
                              const res = await reverseGeocode(lng, lat)
                              if (res) {
                                setRoutePlans((prev) =>
                                  prev.map((rp, i) =>
                                    i === familyIndex
                                      ? { stops: [...rp.stops, { name: res.placeName.split(',')[0], address: res.placeName, lat: res.lat, lng: res.lng }] }
                                      : rp
                                  )
                                )
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="border border-border-default bg-bg-panel px-6 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!basecampGeocoded || !allFamiliesGeocoded || !allStopsGeocoded}
                    className={cn(
                      'border px-6 py-2 text-[11px] font-black uppercase tracking-wider',
                      basecampGeocoded && allFamiliesGeocoded && allStopsGeocoded
                        ? 'border-info bg-info-soft text-info hover:bg-info/20'
                        : 'border-border-default bg-bg-panel text-text-muted cursor-not-allowed'
                    )}
                  >
                    Review & Launch
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Launch */}
            {step === 4 && (
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Step 4
                  </div>
                  <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Review & Launch
                  </h2>
                </div>

                <div className="border border-border-default bg-bg-surface p-4 mb-4">
                  <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-2">
                    Trip Summary
                  </div>
                  <div className="space-y-1 text-[12px]">
                    <div><span className="text-text-secondary">Name:</span> <span className="font-bold text-text-primary">{title}</span></div>
                    {commandName && <div><span className="text-text-secondary">Command:</span> <span className="font-bold text-text-primary">{commandName}</span></div>}
                    <div><span className="text-text-secondary">Dates:</span> <span className="font-bold text-text-primary">{startDate} → {endDate}</span></div>
                    {basecampAddress && (
                      <div>
                        <span className="text-text-secondary">Basecamp:</span>{' '}
                        <span className="font-bold text-text-primary">{basecampAddress}</span>
                        {basecampCoords && (
                          <span className="text-[10px] text-success ml-1">
                            ({basecampCoords.lat.toFixed(4)}, {basecampCoords.lng.toFixed(4)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-border-default bg-bg-surface p-4 mb-4">
                  <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-2">
                    Family Units ({validFamilies.length})
                  </div>
                  <div className="space-y-2">
                    {validFamilies.map((family, i) => (
                      <div key={i} className="text-[12px]">
                        <span className="font-bold text-text-primary">{family.name}</span>
                        <span className="text-text-secondary"> · {family.shortOrigin} · {family.headcount} · {family.vehicle}</span>
                        {family.originLat && (
                          <span className="text-[10px] text-success ml-1">
                            ({family.originLat.toFixed(4)}, {family.originLng.toFixed(4)})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border-default bg-bg-surface p-4">
                  <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-2">
                    Routes
                  </div>
                  <div className="space-y-2">
                    {validFamilies.map((family, i) => {
                      const waypoints = buildWaypointsForFamily(i)
                      return (
                        <div key={i} className="text-[12px]">
                          <span className="font-bold text-text-primary">{family.name}</span>
                          <span className="text-text-secondary">: {waypoints.map((w) => w.name).join(' → ')}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="border border-border-default bg-bg-panel px-6 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || saving}
                    className={cn(
                      'border px-6 py-2 text-[11px] font-black uppercase tracking-wider',
                      canSubmit && !saving
                        ? 'border-success bg-success-soft text-success hover:bg-success/20'
                        : 'border-border-default bg-bg-panel text-text-muted cursor-not-allowed'
                    )}
                  >
                    {saving ? 'Launching...' : 'Launch Operation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
        {label}
        {required && <span className="text-critical ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function StepIndicator({ number, label, active }) {
  return (
    <div className={cn('flex items-center gap-3 py-2', active ? 'opacity-100' : 'opacity-40')}>
      <div className={cn(
        'flex h-6 w-6 items-center justify-center text-[10px] font-black',
        active ? 'bg-info text-bg-base' : 'border border-border-default text-text-secondary'
      )}>
        {number}
      </div>
      <span className={cn('text-[11px] font-bold', active ? 'text-text-primary' : 'text-text-secondary')}>
        {label}
      </span>
    </div>
  )
}
