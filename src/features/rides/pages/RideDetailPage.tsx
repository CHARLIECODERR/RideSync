import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MapPin, Calendar, Users, Clock, 
  ArrowLeft, Fuel, Coffee, PauseCircle,
  Zap, Shield, Navigation, Milestone,
  ChevronRight, AlertTriangle, Play,
  CheckCircle2, Info, Trash2, Loader2,
  Maximize2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useRideStore from '../store/rideStore'
import useAuthStore from '@/features/auth/store/authStore'
import { rideService } from '../services/rideService'
import PremiumMap from '../components/PremiumMap'
import TacticalRideView from '../components/TacticalRideView'
import { cn } from '@/lib/utils'

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    activeRide, 
    setActiveRide, 
    startRide, 
    endRide, 
    deleteRide, 
    currentUserLocation,
    isRideModeActive,
    setRideMode
  } = useRideStore()
  
  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this mission? This action cannot be undone.')) return
    
    try {
      if (!ride?.id) return
      await deleteRide(ride.id)
      navigate('/rides')
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete mission intel.')
    }
  }

  const markers = useMemo(() => {
    if (!ride) return []
    const routeInfo = Array.isArray(ride.route) ? ride.route[0] : ride.route
    
    const baseMarkers = [
      { 
        id: 'start', 
        lat: routeInfo?.start_location?.lat, 
        lng: routeInfo?.start_location?.lng, 
        type: 'start' as const, 
        name: routeInfo?.start_location?.name || 'Start' 
      },
      { 
        id: 'end', 
        lat: routeInfo?.end_location?.lat, 
        lng: routeInfo?.end_location?.lng, 
        type: 'end' as const, 
        name: routeInfo?.end_location?.name || 'End' 
      },
      ...(ride.stops || []).map((s: any) => ({
        id: s.id,
        lat: s.location.lat,
        lng: s.location.lng,
        type: s.type,
        name: s.name
      }))
    ]

    if (currentUserLocation) {
      baseMarkers.push({
        id: 'currentUser',
        lat: currentUserLocation.lat,
        lng: currentUserLocation.lng,
        type: 'other' as const,
        name: 'YOUR LIVE INTEL'
      })
    }

    return baseMarkers.filter(m => m.lat && m.lng)
  }, [ride, currentUserLocation])

  useEffect(() => {
    async function loadRide() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await rideService.getRideDetails(id)
        if (!data) throw new Error('Intel corrupted or mission not found.')
        
        setRide(data)
        
        if (data.status === 'Active') {
          const routeInfo = Array.isArray(data.route) ? data.route[0] : data.route
          setActiveRide({
            ...data,
            community_name: data.communities?.name || 'Vanguard Command',
            distance: routeInfo?.distance_km ? `${routeInfo.distance_km} km` : '0.0 km',
            estimated_duration: routeInfo?.duration_mins ? `${routeInfo.duration_mins} mins` : '0 mins',
            participants: data.participants?.length || 1,
            route: routeInfo // Ensure route is available for navigation
          })
        }
      } catch (err: any) {
        console.error('Mission loading failed', err)
        setError(err.message || 'Mission intel unavailable.')
      } finally {
        setLoading(false)
      }
    }
    loadRide()
  }, [id, setActiveRide])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="h-16 w-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="font-black text-white/20 uppercase tracking-[0.5em] animate-pulse">Loading ride details...</p>
      </div>
    )
  }

  if (error || !ride) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="mx-auto text-primary" size={48} />
        <h2 className="text-4xl font-black uppercase italic">Ride Not Found</h2>
        <p className="text-white/40">{error || "This ride may have been removed."}</p>
        <button onClick={() => navigate('/rides')} className="text-primary font-black uppercase tracking-widest text-sm underline underline-offset-8 transition-all hover:scale-105">Back to Rides</button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'Planned': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'Completed': return 'text-white/40 bg-white/5 border-white/10'
      case 'Cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    }
  }

  if (isRideModeActive) {
    return <TacticalRideView />
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 px-4">
      {/* Header Info */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-saffron transition-colors w-fit group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Records
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className={cn("px-4 py-1.5 border text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-2", getStatusColor(ride.status))}>
                {ride.status === 'Active' && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                {ride.status} Ride
              </span>
              <span className="font-mono text-xs font-bold text-white/20 tracking-widest">{ride.ride_code}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">{ride.name}</h1>
            <p className="text-white/40 text-lg font-bold max-w-2xl leading-relaxed italic border-l-4 border-saffron/30 pl-8">
              {ride.description || "The destination is just an excuse. The real objective is the asphalt between us."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {ride.status === 'Planned' && (
              <button 
                onClick={() => startRide(ride.id)}
                className="group relative flex items-center gap-4 px-10 py-6 bg-emerald-600 text-white font-black uppercase tracking-tighter hover:bg-emerald-500 transition-all skew-x-[-15deg] shadow-2xl shadow-emerald-500/20"
              >
                <div className="skew-x-[15deg] flex items-center gap-2">
                  <Play size={20} fill="currentColor" /> Start Ride
                </div>
              </button>
            )}
            {ride.status === 'Active' && (
              <>
                <button 
                  onClick={() => setRideMode(true)}
                  className="group relative flex items-center gap-4 px-10 py-6 bg-primary text-primary-foreground font-black uppercase tracking-tighter hover:opacity-90 transition-all skew-x-[-15deg] shadow-2xl shadow-primary/20"
                >
                  <div className="skew-x-[15deg] flex items-center gap-2">
                    <Maximize2 size={20} /> Enter Ride Mode
                  </div>
                </button>
                <button 
                  onClick={() => endRide(ride.id)}
                  className="group relative flex items-center gap-4 px-10 py-6 bg-red-600 text-white font-black uppercase tracking-tighter hover:bg-red-500 transition-all skew-x-[-15deg] shadow-2xl shadow-red-500/20"
                >
                  <div className="skew-x-[15deg] flex items-center gap-2">
                    <CheckCircle2 size={20} /> Finish Ride
                  </div>
                </button>
              </>
            )}

            {user?.id === ride.created_by && (
              <button 
                onClick={handleDelete}
                className="px-6 py-6 bg-red-600/10 border border-red-600/30 text-red-500 font-black uppercase tracking-tighter transition-all skew-x-[-15deg] hover:bg-red-600 hover:text-white"
              >
                <div className="skew-x-[15deg]">
                  <Trash2 size={20} />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Mission Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 xl:h-[calc(100vh-400px)] min-h-[600px]">
        {/* Map - Takes 3 columns */}
        <div className="xl:col-span-3 h-full relative">
          <PremiumMap 
            center={markers[0] ? [markers[0].lat, markers[0].lng] : [20.5937, 78.9629]} 
            zoom={12}
            markers={markers}
            preloadedRoute={(Array.isArray(ride.route) ? ride.route[0] : ride.route)?.geometry}
          />
        </div>

        {/* Sidebar Info - Takes 1 column */}
        <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          {/* Tactical Specs */}
          <section className="bg-zinc-950 border border-white/5 p-8 space-y-6 shadow-2xl">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
              <Shield size={14} /> Ride Details
            </h3>
            
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/40">
                  <Milestone size={20} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total Distance</div>
                  <div className="text-lg font-black italic">{(Array.isArray(ride.route) ? ride.route[0] : ride.route)?.distance_km || '0'} KM</div>
                </div>
              </div>
 
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/40">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Est. Duration</div>
                  <div className="text-lg font-black italic">{(Array.isArray(ride.route) ? ride.route[0] : ride.route)?.duration_mins || '0'} MINS</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/40">
                  <Navigation size={20} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Route Type</div>
                  <div className="text-lg font-black italic uppercase">HIGHWAY PATROL</div>
                </div>
              </div>
            </div>
          </section>

          {/* Logistics Area (Stops) */}
          <section className="bg-zinc-950 border border-white/5 p-8 space-y-6">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
              <Fuel size={14} /> Route Stops
            </h3>

            <div className="space-y-4">
              {ride.stops && ride.stops.length > 0 ? (
                ride.stops.sort((a: any, b: any) => a.order - b.order).map((stop: any, i: number) => (
                  <div key={stop.id} className="relative pl-6 pb-4 last:pb-0 group">
                    {i !== ride.stops.length - 1 && (
                      <div className="absolute left-1 top-2 bottom-0 w-px bg-white/10 group-hover:bg-saffron/50 transition-colors" />
                    )}
                    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full border border-white/20 bg-zinc-950 group-hover:border-saffron group-hover:bg-saffron transition-all" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider">{stop.name}</h4>
                        <span className="text-[9px] font-bold text-white/20 px-2 py-0.5 border border-white/10 rounded uppercase">{stop.type}</span>
                      </div>
                      <p className="text-[10px] font-bold text-white/40 italic">{stop.note || "Standard operational procedures apply."}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                  <div className="text-[10px] font-black text-white/20 uppercase">No stops scheduled</div>
                </div>
              )}
            </div>
          </section>

          {/* Action Log / Alerts (Coming from status or store) */}
          <section className="bg-zinc-950 border border-white/5 p-8 space-y-6">
            <h3 className="text-[10px] font-black text-saffron uppercase tracking-[0.5em] flex items-center gap-2">
              <Info size={14} /> Intel Channel
            </h3>
            <div className="space-y-4">
              {ride.status === 'Active' ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Mission Active</p>
                  </div>
                  <div className="space-y-1 py-2 border-t border-emerald-500/10">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Live GPS Coordinates</p>
                    {currentUserLocation ? (
                      <div className="flex items-center justify-between font-mono text-[11px] font-bold text-emerald-400">
                        <span>LAT: {currentUserLocation.lat.toFixed(6)}</span>
                        <span>LNG: {currentUserLocation.lng.toFixed(6)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 italic">
                        <Loader2 size={10} className="animate-spin" /> Acquiring satellite lock...
                      </div>
                    )}
                  </div>
                  <div className="text-[9px] font-bold text-white/40 italic leading-snug">
                    Telemetry data is being broadcasted at 1Hz with high-precision accuracy.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-white/40 italic">Waiting for field transmissions...</div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
