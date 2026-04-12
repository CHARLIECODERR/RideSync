import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MapPin, Calendar, Users, Clock, 
  ArrowLeft, Fuel, Coffee, PauseCircle,
  Zap, Shield, Navigation, Milestone,
  ChevronRight, AlertTriangle, Play,
  CheckCircle2, Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useRideStore from '../store/rideStore'
import { rideService } from '../services/rideService'
import PremiumMap from '../components/PremiumMap'
import { cn } from '@/lib/utils'

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeRide, setActiveRide, startRide, endRide } = useRideStore()
  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const markers = useMemo(() => {
    if (!ride) return []
    return [
      { id: 'start', lat: ride.route?.[0]?.start_location?.lat, lng: ride.route?.[0]?.start_location?.lng, type: 'start' as const, name: ride.route?.[0]?.start_location?.name || 'Start' },
      { id: 'end', lat: ride.route?.[0]?.end_location?.lat, lng: ride.route?.[0]?.end_location?.lng, type: 'end' as const, name: ride.route?.[0]?.end_location?.name || 'End' },
      ...(ride.stops || []).map((s: any) => ({
        id: s.id,
        lat: s.location.lat,
        lng: s.location.lng,
        type: s.type,
        name: s.name
      }))
    ].filter(m => m.lat && m.lng)
  }, [ride])

  useEffect(() => {
    async function loadRide() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        console.log('Fetching mission intel for:', id)
        const data = await rideService.getRideDetails(id)
        if (!data) throw new Error('Intel corrupted or mission not found.')
        
        setRide(data)
        
        // Also set as active in store if user is viewing it and it's active
        if (data.status === 'Active') {
          setActiveRide({
            ...data,
            community_name: data.communities?.name || 'Vanguard Command',
            distance: data.route?.[0]?.distance_km ? `${data.route[0].distance_km} km` : '0.0 km',
            estimated_duration: data.route?.[0]?.duration_mins ? `${data.route[0].duration_mins} mins` : '0 mins',
            participants: data.participants?.length || 1
          })
        }
      } catch (err: any) {
        console.error('CRITICAL ERROR: Mission loading failed', err)
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

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
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

          <div className="flex gap-4">
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
              <button 
                onClick={() => endRide(ride.id)}
                className="group relative flex items-center gap-4 px-10 py-6 bg-red-600 text-white font-black uppercase tracking-tighter hover:bg-red-500 transition-all skew-x-[-15deg] shadow-2xl shadow-red-500/20"
              >
                <div className="skew-x-[15deg] flex items-center gap-2">
                  <CheckCircle2 size={20} /> Finish Ride
                </div>
              </button>
            )}
            <button className="px-10 py-6 bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-tighter transition-all skew-x-[-15deg] hover:bg-white/10">
               <div className="skew-x-[15deg] flex items-center gap-2">
                  <Zap size={20} className="text-saffron" /> Signal Pack
                </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mission Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[calc(100vh-400px)] min-h-[600px]">
        {/* Map - Takes 3 columns */}
        <div className="xl:col-span-3 h-full relative">
          <PremiumMap 
            center={markers[0] ? [markers[0].lat, markers[0].lng] : [20.5937, 78.9629]} 
            zoom={12}
            markers={markers}
            preloadedRoute={ride.route?.[0]?.geometry}
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
                  <div className="text-lg font-black italic">{ride.route?.[0]?.distance_km || '0'} KM</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/40">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Est. Duration</div>
                  <div className="text-lg font-black italic">{ride.route?.[0]?.duration_mins || '0'} MINS</div>
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
                    {/* Vertical Line */}
                    {i !== ride.stops.length - 1 && (
                      <div className="absolute left-1 top-2 bottom-0 w-px bg-white/10 group-hover:bg-saffron/50 transition-colors" />
                    )}
                    {/* Dot */}
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
          <section className="bg-zinc-950 border border-white/5 p-8 space-y-6 opacity-60">
            <h3 className="text-[10px] font-black text-saffron uppercase tracking-[0.5em] flex items-center gap-2">
              <Info size={14} /> Intel Channel
            </h3>
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-white/40 italic">Waiting for field transmissions...</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
