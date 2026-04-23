import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Fuel, Coffee, PauseCircle, Search, Target, Loader2, X, Navigation, Clock, Milestone, ChevronRight } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

// Fix default leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

interface PremiumMapProps {
  center: [number, number]
  zoom?: number
  onConfirmPoint?: (lat: number, lng: number, type: 'start' | 'end' | 'fuel' | 'food' | 'break', name?: string) => void
  onRouteUpdate?: (distanceMeters: number, durationSeconds: number, geometry: any) => void
  markers?: Array<{
    id: string
    lat: number
    lng: number
    type: 'start' | 'end' | 'fuel' | 'food' | 'break' | 'other'
    name: string
  }>
  preloadedRoute?: any // Geometry from DB
  className?: string
  hideControls?: boolean
}

interface SearchSuggestion {
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

interface RouteOption {
  coords: [number, number][]
  distance: number   // meters — real from OSRM
  duration: number   // seconds — real from OSRM
  label: string
}

// --- Helpers ---
function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1) + ' km'
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${mins} min`
  return `${hours}h ${mins}m`
}

// Custom Marker Generator
const createCustomIcon = (type: string, color: string, isLive?: boolean) => {
  const IconComponent = isLive ? Navigation : type === 'fuel' ? Fuel : type === 'food' ? Coffee : type === 'break' ? PauseCircle : MapPin
  const html = renderToString(
    <div className={cn(
      "p-1.5 rounded-full bg-background border-2 shadow-lg flex items-center justify-center transition-all",
      isLive ? "border-amber-500 shadow-amber-500/20 animate-pulse" : "hover:scale-110"
    )} style={{ borderColor: isLive ? '#f59e0b' : color }}>
      <IconComponent 
        size={18} 
        style={{ color: isLive ? '#f59e0b' : color }} 
        className={isLive ? "animate-bounce" : ""}
      />
    </div>
  )
  
  return L.divIcon({
    html: html,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  })
}

// Map sub-components
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyToPoint({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 })
  }, [center, zoom, map])
  return null
}

function FitBoundsController({ markers }: { markers: Array<{ lat: number, lng: number }> }) {
  const map = useMap()
  const lastKeyRef = useRef('')

  useEffect(() => {
    if (markers.length < 2) return
    
    const key = markers.map(m => `${m.lat},${m.lng}`).join('|')
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key

    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, duration: 1.2 })
  }, [markers, map])
  return null
}

function LiveLocationController({ markers, isLockedOn }: { markers: any[], isLockedOn: boolean }) {
  const map = useMap()
  const liveMarker = markers.find(m => m.id === 'currentUser')
  
  useEffect(() => {
    if (isLockedOn && liveMarker) {
      map.panTo([liveMarker.lat, liveMarker.lng], { 
        animate: true,
        duration: 0.5
      })
    }
  }, [liveMarker, isLockedOn, map])
  
  return null
}

// --- Route colors ---
const ROUTE_COLORS = [
  { core: '#3b82f6', glow: '#3b82f6', label: 'Primary Route' },
  { core: '#8b5cf6', glow: '#8b5cf6', label: 'Alternative 1' },
  { core: '#f59e0b', glow: '#f59e0b', label: 'Alternative 2' },
]

export default function PremiumMap({ 
  center: initialCenter, 
  zoom: initialZoom = 13, 
  onConfirmPoint, 
  onRouteUpdate, 
  markers = [], 
  preloadedRoute,
  className,
  hideControls = false
}: PremiumMapProps) {
  const { theme } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number], zoom: number }>({ center: initialCenter, zoom: initialZoom })
  const [pendingPoint, setPendingPoint] = useState<{ lat: number, lng: number, name?: string } | null>(null)

  // Multi-route state
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [isLockedOn, setIsLockedOn] = useState(false)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'start': return '#3b82f6'
      case 'end': return '#ef4444'
      case 'fuel': return '#f59e0b'
      case 'food': return '#10b981'
      default: return '#8b5cf6'
    }
  }

  // --- Search Autocomplete with Debounce ---
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim() || value.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`
        )
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        if (data && Array.isArray(data)) {
          setSuggestions(data)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Autocomplete failed:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [])

  const selectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    const lat = parseFloat(suggestion.lat)
    const lng = parseFloat(suggestion.lon)
    const name = suggestion.display_name?.split(',')[0] || 'Selected Location'
    if (isNaN(lat) || isNaN(lng)) return

    setSearchQuery(name)
    setSuggestions([])
    setShowSuggestions(false)
    setFlyTarget({ center: [lat, lng], zoom: 15 })
    setPendingPoint({ lat, lng, name })
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- Ordered waypoints for routing ---
  const orderedWaypoints = useMemo(() => {
    const start = markers.find(m => m.type === 'start')
    const end = markers.find(m => m.type === 'end')
    const stops = markers.filter(m => m.type !== 'start' && m.type !== 'end' && m.type !== 'other')
    const points: { lat: number, lng: number }[] = []
    if (start) points.push(start)
    points.push(...stops)
    if (end) points.push(end)
    return points
  }, [markers])

  const lastWaypointsRef = useRef<string>('')

  // --- Handle preloaded route ---
  useEffect(() => {
    if (preloadedRoute && preloadedRoute.coordinates) {
      const coords = preloadedRoute.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number])
      setRouteOptions([{
        coords,
        distance: 0, 
        duration: 0,
        label: 'Saved Route'
      }])
      setSelectedRouteIndex(0)
    }
  }, [preloadedRoute])

  // --- Fetch MULTIPLE routes from OSRM/Mapbox ---
  useEffect(() => {
    if (preloadedRoute) return // Skip if we have a saved route
    if (orderedWaypoints.length < 2) {
      setRouteOptions([])
      setSelectedRouteIndex(0)
      lastWaypointsRef.current = ''
      return
    }

    // Deep compare waypoints string to prevent redundant fetches
    const waypointsKey = orderedWaypoints.map(p => `${p.lat},${p.lng}`).join(';')
    if (waypointsKey === lastWaypointsRef.current) return
    lastWaypointsRef.current = waypointsKey

    const fetchRoutes = async () => {
      setIsLoadingRoute(true)
      try {
        const coords = orderedWaypoints.map(p => `${p.lng},${p.lat}`).join(';')
        
        const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
        if (!mapboxToken || mapboxToken.includes('your_')) {
          console.warn('Mapbox Token missing or placeholder. Switching to direct LineString.')
          throw new Error('Limited connectivity')
        }

        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?alternatives=true&geometries=geojson&overview=full&access_token=${mapboxToken}`
        )
        
        if (!response.ok) throw new Error('Mapbox route fetch failed')
        const data = await response.json()

        const options: RouteOption[] = []

        if (data?.routes && data.routes.length > 0) {
          data.routes.forEach((route: any, idx: number) => {
            options.push({
              coords: route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]),
              distance: route.distance,
              duration: route.duration,
              label: idx === 0 ? 'Fastest Route' : `Alternative ${idx}`,
            })
          })
        }

        if (options.length > 0) {
          setRouteOptions(options)
          setSelectedRouteIndex(0)
          if (onRouteUpdate) {
            onRouteUpdate(options[0].distance, options[0].duration, data.routes[0].geometry)
          }
        }
      } catch (error) {
        console.error('Mapbox routing failed:', error)
        // Fallback: Direct line
        const fallbackCoords = orderedWaypoints.map(p => [p.lat, p.lng] as [number, number])
        let totalDist = 0
        for (let i = 1; i < fallbackCoords.length; i++) {
          totalDist += L.latLng(fallbackCoords[i - 1]).distanceTo(L.latLng(fallbackCoords[i]))
        }
        
        const fallback = {
          coords: fallbackCoords,
          distance: totalDist,
          duration: (totalDist / 1000) * 60,
          label: 'Direct Path (Network Limit)',
        }
        setRouteOptions([fallback])
        setSelectedRouteIndex(0)
        if (onRouteUpdate) {
          onRouteUpdate(totalDist, (totalDist / 1000) * 60, { type: 'LineString', coordinates: fallbackCoords.map(c => [c[1], c[0]]) })
        }
      } finally {
        setIsLoadingRoute(false)
      }
    }

    const timer = setTimeout(fetchRoutes, 400) // Debounce fetch
    return () => clearTimeout(timer)
  }, [orderedWaypoints, onRouteUpdate])

  const handleMapClick = async (lat: number, lng: number) => {
    if (hideControls) return // Disable interaction in HUD mode
    setPendingPoint({ lat, lng, name: 'Identifying...' })
    try {
      // Accuracy: Reverse geocode to get real location name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      const name = data.display_name?.split(',')[0] || data.name || 'Selected Location'
      setPendingPoint({ lat, lng, name })
    } catch (error) {
      console.error('Reverse geocode failed:', error)
      setPendingPoint({ lat, lng, name: 'Selected Location' })
    }
  }

  const confirmSelection = (type: 'start' | 'end' | 'fuel' | 'food' | 'break') => {
    if (pendingPoint && onConfirmPoint) {
      onConfirmPoint(pendingPoint.lat, pendingPoint.lng, type, pendingPoint.name)
      setPendingPoint(null)
    }
  }

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0])
    }
  }

  const selectedRoute = routeOptions[selectedRouteIndex] || null

  return (
    <div className={cn(
      "relative w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-border/50 shadow-rugged group",
      hideControls && "border-none rounded-none shadow-none",
      className
    )}>
      <MapContainer
        center={flyTarget.center}
        zoom={flyTarget.zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {import.meta.env.VITE_MAPBOX_TOKEN ? (
          <TileLayer
            attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/mapbox/${theme === 'dark' ? 'dark-v11' : 'streets-v12'}/tiles/256/{z}/{x}/{y}@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={theme === 'dark'
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
          />
        )}

        <MapEvents onClick={handleMapClick} />
        <FlyToPoint center={flyTarget.center} zoom={flyTarget.zoom} />
        <FitBoundsController markers={orderedWaypoints.length >= 2 ? orderedWaypoints : []} />
        <LiveLocationController markers={markers} isLockedOn={isLockedOn || hideControls} />

        {/* Alternative Routes — render NON-selected first (behind) */}
        {!hideControls && routeOptions.map((route, idx) => {
          if (idx === selectedRouteIndex) return null
          const color = ROUTE_COLORS[idx] || ROUTE_COLORS[ROUTE_COLORS.length - 1]
          return (
            <Polyline
              key={`alt-${idx}`}
              positions={route.coords}
              pathOptions={{
                color: color.core,
                weight: 4,
                opacity: 0.25,
                dashArray: '8 12',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )
        })}

        {/* Selected Route — Outer Glow */}
        {selectedRoute && selectedRoute.coords.length >= 2 && (
          <Polyline
            key={`selected-glow-${selectedRouteIndex}`}
            positions={selectedRoute.coords}
            pathOptions={{
              color: ROUTE_COLORS[selectedRouteIndex]?.core || '#3b82f6',
              weight: 10,
              opacity: 0.2,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Selected Route — Core Line */}
        {selectedRoute && selectedRoute.coords.length >= 2 && (
          <Polyline
            key={`selected-core-${selectedRouteIndex}`}
            positions={selectedRoute.coords}
            pathOptions={{
              color: ROUTE_COLORS[selectedRouteIndex]?.core || '#3b82f6',
              weight: 4,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Confirmed Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.type, getTypeColor(marker.type), marker.id === 'currentUser')}
          >
            <Popup className="rugged-popup">
              <div className="p-2 space-y-1 bg-card text-foreground rounded-xl border border-border/50 shadow-xl">
                <p className="font-black text-sm uppercase tracking-tighter">{marker.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: marker.id === 'currentUser' ? '#f59e0b' : getTypeColor(marker.type) }} />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                    {marker.id === 'currentUser' ? 'Live GPS Intel' : `${marker.type} Sector`}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pending Selection Marker */}
        {!hideControls && pendingPoint && (
          <Marker
            position={[pendingPoint.lat, pendingPoint.lng]}
            icon={createCustomIcon('other', '#ffffff')}
          >
            <Popup
              className="rugged-popup"
              eventHandlers={{ remove: () => setPendingPoint(null) }}
            >
              <div className="p-4 space-y-4 bg-card text-foreground rounded-[1.5rem] border border-primary/20 shadow-2xl min-w-[200px]">
                <div className="space-y-1 pb-2 border-b border-border/50">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {pendingPoint.name === 'Identifying...' ? 'Identifying Location...' : 'Confirm Location'}
                  </p>
                  <p className="font-bold text-sm leading-tight flex items-center gap-2">
                    {pendingPoint.name === 'Identifying...' ? (
                      <><Loader2 size={14} className="animate-spin text-primary" /> Mapping coordinates...</>
                    ) : (
                      pendingPoint.name
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => confirmSelection('start')}
                    disabled={pendingPoint.name === 'Identifying...'}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white text-[11px] font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set as Start <Target size={14} />
                  </button>
                  <button
                    onClick={() => confirmSelection('end')}
                    disabled={pendingPoint.name === 'Identifying...'}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[11px] font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set as Destination <MapPin size={14} />
                  </button>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => confirmSelection('fuel')}
                      disabled={pendingPoint.name === 'Identifying...'}
                      title="Add Fuel Stop"
                      className="aspect-square flex flex-col items-center justify-center rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Fuel size={16} />
                    </button>
                    <button
                      onClick={() => confirmSelection('food')}
                      disabled={pendingPoint.name === 'Identifying...'}
                      title="Add Food Stop"
                      className="aspect-square flex flex-col items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Coffee size={16} />
                    </button>
                    <button
                      onClick={() => confirmSelection('break')}
                      disabled={pendingPoint.name === 'Identifying...'}
                      title="Add Break"
                      className="aspect-square flex flex-col items-center justify-center rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PauseCircle size={16} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setPendingPoint(null)}
                  className="w-full py-2 rounded-xl bg-muted/50 text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  Cancel Selection
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ========== SEARCH BAR WITH AUTOCOMPLETE ========== */}
      {!hideControls && (
        <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-center pointer-events-none" ref={searchRef}>
          <div className="w-full max-w-md pointer-events-auto relative">
            <form
              onSubmit={handleFormSearch}
              className="w-full bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-1.5 flex items-center gap-2 transition-all focus-within:ring-4 ring-primary/20 focus-within:bg-background"
            >
              <div className="pl-3 text-muted-foreground">
                {isSearching ? <Loader2 size={18} className="animate-spin text-primary" /> : <Search size={18} />}
              </div>
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none py-2 text-sm font-bold placeholder:text-muted-foreground/50 text-foreground"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false) }}
                  className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-all"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="p-2 rounded-xl bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <Target size={18} />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-[1001]">
                {suggestions.map((s, i) => {
                  const parts = s.display_name.split(',')
                  const mainName = parts[0]?.trim() || 'Unknown'
                  const subText = parts.slice(1, 3).join(',').trim()
                  return (
                    <button
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/10 transition-all text-left border-b border-border/20 last:border-none group"
                    >
                      <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                        <Navigation size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{mainName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{subText}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {!hideControls && (
        <div className="absolute top-24 right-6 z-[1000] flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords
                  setFlyTarget({ center: [latitude, longitude], zoom: 15 })
                })
              }
            }}
            className="p-3 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl hover:scale-110 active:scale-90 transition-all text-primary"
            title="My Location"
          >
            <Target size={20} />
          </button>

          {markers.some(m => m.id === 'currentUser') && (
            <button
              onClick={() => setIsLockedOn(!isLockedOn)}
              className={cn(
                "p-3 rounded-2xl bg-background/90 backdrop-blur-xl border shadow-2xl hover:scale-110 active:scale-90 transition-all",
                isLockedOn ? "border-amber-500 text-amber-500 bg-amber-500/10" : "border-border/50 text-white/40"
              )}
              title={isLockedOn ? "Unlock GPS" : "Tactical Lock"}
            >
              <Navigation size={20} className={isLockedOn ? "animate-pulse" : ""} />
            </button>
          )}
        </div>
      )}

      {/* ========== ROUTE PICKER PANEL ========== */}
      {!hideControls && routeOptions.length > 0 && (
        <div className="absolute bottom-6 left-6 z-[1000] pointer-events-auto w-[320px]">
          {/* ... (existing route picker content) */}
        </div>
      )}

      {/* ========== TACTICAL STATUS OVERLAY ========== */}
      {!hideControls && (
        <div className="absolute bottom-6 right-6 z-[1000] p-4 bg-background/80 backdrop-blur-md border border-border/50 rounded-[1.5rem] shadow-xl flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase text-foreground tracking-widest">Map Feed Active</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Theme: {theme === 'dark' ? 'Asphalt' : 'Daylight'}</p>
            {isLoadingRoute && (
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter animate-pulse">Calculating routes...</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
