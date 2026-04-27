import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Plus, Trash2, Fuel, Coffee, PauseCircle,
  ArrowRight, Route, Calendar, Users, Info, ChevronRight,
  ShieldCheck, Navigation, Zap, Map as MapIcon, Clock, Check, X
} from 'lucide-react'
import useRideStore from '@/features/rides/store/rideStore'
import useCommunityStore from '@/features/community/store/communityStore'
import PremiumMap from '../components/PremiumMap'
import { RideStop, RideRoute } from '../services/rideService'
import { cn } from '@/lib/utils'

export default function CreateRidePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const communityIdParam = searchParams.get('communityId')
  const { createRide } = useRideStore()
  const { communities, fetchCommunities } = useCommunityStore()

  useEffect(() => {
    fetchCommunities()
    if (communityIdParam) {
      setForm(prev => ({ ...prev, community_id: communityIdParam }))
    }
  }, [fetchCommunities, communityIdParam])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<string>('')
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [step, setStep] = useState(1) // 1: Basics, 2: Route

  const [form, setForm] = useState({
    name: '',
    description: '',
    community_id: '',
    start_time: '',
    max_participants: 15,
  })

  const [route, setRoute] = useState<RideRoute>({
    ride_id: '',
    start_location: { lat: 19.0760, lng: 72.8777, name: '' },
    end_location: { lat: 19.0760, lng: 72.8777, name: '' },
    waypoints: []
  })

  const [stops, setStops] = useState<RideStop[]>([])
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | 'stop' | null>(null)

  const stopTypes = [
    { value: 'fuel' as const, label: 'Fuel', icon: Fuel, color: '#f59e0b', bg: 'bg-amber-500/10' },
    { value: 'food' as const, label: 'Food', icon: Coffee, color: '#10b981', bg: 'bg-emerald-500/10' },
    { value: 'break' as const, label: 'Break', icon: PauseCircle, color: '#3b82f6', bg: 'bg-blue-500/10' },
  ]

  const handleConfirmPoint = useCallback((lat: number, lng: number, type: 'start' | 'end' | 'fuel' | 'food' | 'break', name?: string) => {
    const locationName = name || (type === 'start' ? 'Starting Point' : type === 'end' ? 'Final Destination' : `${type.charAt(0).toUpperCase() + type.slice(1)} Stop`)

    if (type === 'start') {
      setRoute(prev => ({ 
        ...prev, 
        start_location: { ...prev.start_location, lat, lng, name: locationName } 
      }))
      // Auto-switch to end selection if not set
      if (!route.end_location.name) setSelectionMode('end')
      else setSelectionMode(null)
    } else if (type === 'end') {
      setRoute(prev => ({ 
        ...prev, 
        end_location: { ...prev.end_location, lat, lng, name: locationName } 
      }))
      setSelectionMode(null)
    } else {
      const newStop: RideStop = {
        ride_id: '',
        name: locationName,
        type: type,
        location: { lat, lng },
        order: stops.length + 1
      }
      setStops(prev => [...prev, newStop])
      setSelectionMode(null)
    }
  }, [stops.length, route.end_location.name])

  const handleRouteUpdate = useCallback((distance: number, duration: number, geometry: any) => {
    setRoute(prev => ({
      ...prev,
      distance_km: parseFloat((distance / 1000).toFixed(2)),
      duration_mins: Math.round(duration / 60),
      geometry
    }))
  }, [])

  const markers = useMemo(() => [
    ...(route.start_location.name ? [{ id: 'start', lat: route.start_location.lat, lng: route.start_location.lng, type: 'start' as const, name: route.start_location.name }] : []),
    ...(route.end_location.name ? [{ id: 'end', lat: route.end_location.lat, lng: route.end_location.lng, type: 'end' as const, name: route.end_location.name }] : []),
    ...stops.map((s, i) => ({ id: `stop-${i}`, lat: s.location.lat, lng: s.location.lng, type: s.type, name: s.name }))
  ], [route.start_location, route.end_location, stops])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      setSubmissionStatus('Establishing ride data...')
      const finalRoute = {
        ...route,
        start_location: { ...route.start_location },
        end_location: { ...route.end_location },
        waypoints: route.waypoints || []
      }

      setSubmissionStatus('Logging route & stops...')
      await createRide(form, finalRoute, stops)
      
      setSubmissionStatus('Ride transmission complete!')
      await new Promise(r => setTimeout(r, 800))
      navigate('/rides')
    } catch (error: any) {
      console.error('Creation failed', error)
      setSubmissionError(error.message || 'Transmission failed. Ensure all waypoints are set.')
    } finally {
      setIsSubmitting(false)
      setSubmissionStatus('')
    }
  }

  const isBasicsComplete = form.name && form.community_id && form.start_time

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 pb-10">
      {/* Sidebar Flow */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[400px] flex flex-col gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
            <ShieldCheck size={14} className="animate-pulse" /> Strategic Setup
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Assemble Ride</h1>
        </div>

        <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Stepper Header */}
          <div className="flex items-center gap-1 p-2 bg-muted/20 border-b border-border/10">
            <button 
              onClick={() => setStep(1)} 
              className={cn(
                "flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                step === 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              <Info size={14} /> 1. Intel
            </button>
            <button 
              onClick={() => isBasicsComplete && setStep(2)} 
              disabled={!isBasicsComplete}
              className={cn(
                "flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                step === 2 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 disabled:opacity-30"
              )}
            >
              <MapIcon size={14} /> 2. Route
            </button>
          </div>

          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="space-y-6"
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Mission Name</label>
                      <input 
                        type="text" 
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none font-bold text-sm transition-all shadow-inner" 
                        placeholder="e.g. Western Ghats Expedition" 
                        value={form.name} 
                        onChange={e => setForm({ ...form, name: e.target.value })} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Start Time</label>
                        <div className="relative">
                          <input 
                            type="datetime-local" 
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-xs font-bold transition-all [color-scheme:dark]" 
                            value={form.start_time} 
                            onChange={e => setForm({ ...form, start_time: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Limit</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                          <input 
                            type="number" 
                            className="w-full pl-10 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-xs font-bold transition-all" 
                            value={form.max_participants} 
                            onChange={e => setForm({ ...form, max_participants: parseInt(e.target.value) })} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Command Hub (Community)</label>
                      <select 
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none font-bold text-sm transition-all appearance-none cursor-pointer hover:bg-white/10 shadow-inner" 
                        value={form.community_id} 
                        onChange={e => setForm({ ...form, community_id: e.target.value })}
                      >
                        <option value="" className="bg-zinc-900">Select a Regiment</option>
                        {communities.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Mission Objective (Description)</label>
                      <textarea 
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none font-bold text-sm min-h-[100px] resize-none transition-all placeholder:text-white/10" 
                        placeholder="Detail the terrain, gear required, and rules of engagement..."
                        value={form.description} 
                        onChange={e => setForm({ ...form, description: e.target.value })} 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)} 
                    disabled={!isBasicsComplete} 
                    className="w-full py-5 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    Set Navigation <ChevronRight size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase text-center bg-white/5 p-3 rounded-xl border border-white/5">
                      Select a point on the map to define waypoints.
                    </p>

                    <div className="space-y-3">
                      {/* Guidance UI for Map Selection */}
                      <button 
                        onClick={() => setSelectionMode('start')}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group",
                          selectionMode === 'start' ? "border-blue-500 bg-blue-500/10" : route.start_location.name ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", route.start_location.name ? "bg-emerald-500 text-white" : "bg-blue-500/20 text-blue-500")}>
                          {route.start_location.name ? <Check size={20} /> : <MapPin size={20} />}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Starting Point</p>
                          <p className="text-sm font-black truncate uppercase italic">{route.start_location.name || "Select on Map..."}</p>
                        </div>
                        {selectionMode === 'start' && <Zap size={16} className="text-blue-500 animate-pulse" />}
                      </button>

                      <div className="relative pl-5 ml-5 border-l-2 border-white/5 space-y-3">
                        <AnimatePresence>
                          {stops.map((s, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={i} 
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group"
                            >
                              <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                                {stopTypes.find(t => t.value === s.type)?.icon && <Plus size={12} />}
                              </div>
                              <span className="text-[11px] font-black flex-1 uppercase truncate italic">{s.name}</span>
                              <button onClick={() => setStops(stops.filter((_, idx) => idx !== i))} className="p-2 text-red-500/50 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <button 
                          onClick={() => setSelectionMode('stop')}
                          className={cn(
                            "w-full p-3 rounded-xl border border-dashed flex items-center justify-center gap-3 transition-all",
                            selectionMode === 'stop' ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/20 hover:border-white/30 hover:text-white/40"
                          )}
                        >
                          <Plus size={16} /> <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Tactical Stop</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => setSelectionMode('end')}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group",
                          selectionMode === 'end' ? "border-red-500 bg-red-500/10" : route.end_location.name ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", route.end_location.name ? "bg-emerald-500 text-white" : "bg-red-500/20 text-red-500")}>
                          {route.end_location.name ? <Check size={20} /> : <Navigation size={20} />}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-red-500">Destination</p>
                          <p className="text-sm font-black truncate uppercase italic">{route.end_location.name || "Select on Map..."}</p>
                        </div>
                        {selectionMode === 'end' && <Zap size={16} className="text-red-500 animate-pulse" />}
                      </button>
                    </div>

                    {route.distance_km ? (
                      <div className="grid grid-cols-2 gap-2 mt-6">
                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-center">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Distance</p>
                          <p className="text-xl font-black italic">{route.distance_km} KM</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-center">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Est. Time</p>
                          <p className="text-xl font-black italic">{route.duration_mins} MIN</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-5 gap-3 pt-4">
                    <button onClick={() => setStep(1)} disabled={isSubmitting} className="col-span-2 py-4 rounded-2xl bg-muted/50 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2">
                       Abort
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || !route.start_location.name || !route.end_location.name} 
                      className="col-span-3 py-4 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                    >
                      {isSubmitting ? <><Zap size={16} className="animate-spin" /> ...</> : <><ShieldCheck size={18} /> Deploy Mission</>}
                    </button>
                  </div>
                  {submissionError && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase text-center">{submissionError}</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Map Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="flex-1 relative bg-card rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl"
      >
        <PremiumMap 
          center={[19.0760, 72.8777]} 
          onConfirmPoint={handleConfirmPoint} 
          onRouteUpdate={handleRouteUpdate} 
          markers={markers} 
          selectionMode={selectionMode}
        />
        
        {/* Map Selection Overlay Hint */}
        <AnimatePresence>
          {selectionMode && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-[1001] px-8 py-4 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center gap-4 border-2 border-white/20"
            >
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">Select {selectionMode} Point on the Map</p>
              <button onClick={() => setSelectionMode(null)} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
