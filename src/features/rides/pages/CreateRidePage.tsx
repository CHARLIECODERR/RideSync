import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Plus, Trash2, Fuel, Coffee, PauseCircle,
  ArrowRight, Route, Calendar, Users, Info, ChevronRight,
  ShieldCheck, Navigation
} from 'lucide-react'
import useRideStore from '@/features/rides/store/rideStore'
import useCommunityStore from '@/features/community/store/communityStore'
import PremiumMap from '../components/PremiumMap'
import { RideStop, RideRoute } from '../services/rideService'
import { cn } from '@/lib/utils'

export default function CreateRidePage() {
  const navigate = useNavigate()
  const { createRide } = useRideStore()
  const { communities } = useCommunityStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Intel, 2: Route

  const [form, setForm] = useState({
    name: '',
    description: '',
    community_id: '',
    start_time: '',
    max_participants: 15,
  })

  const [route, setRoute] = useState<RideRoute>({
    ride_id: '',
    start_location: { lat: 19.0760, lng: 72.8777, name: '' }, // Mumbai default
    end_location: { lat: 19.0760, lng: 72.8777, name: '' },
    waypoints: []
  })

  const [stops, setStops] = useState<RideStop[]>([])

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
    } else if (type === 'end') {
      setRoute(prev => ({ 
        ...prev, 
        end_location: { ...prev.end_location, lat, lng, name: locationName } 
      }))
    } else {
      const newStop: RideStop = {
        ride_id: '',
        name: locationName,
        type: type,
        location: { lat, lng },
        order: stops.length + 1
      }
      setStops(prev => [...prev, newStop])
    }
  }, [stops.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createRide(form, route, stops)
      navigate('/rides')
    } catch (error) {
      console.error('Creation failed', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const markers = [
    ...(route.start_location.name ? [{ id: 'start', lat: route.start_location.lat, lng: route.start_location.lng, type: 'start' as const, name: route.start_location.name }] : []),
    ...(route.end_location.name ? [{ id: 'end', lat: route.end_location.lat, lng: route.end_location.lng, type: 'end' as const, name: route.end_location.name }] : []),
    ...stops.map((s, i) => ({ id: `stop-${i}`, lat: s.location.lat, lng: s.location.lng, type: s.type, name: s.name }))
  ]

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 pb-10">
      {/* Left Panel: Form & Intel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/3 space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <ShieldCheck size={14} className="animate-pulse" />
            Mission Command
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none italic uppercase">Forge Mission</h1>
          <p className="text-muted-foreground text-sm font-medium">Define your objectives and tactical route.</p>
        </div>

        {/* Form Container */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 shadow-rugged space-y-8">
          {/* Step Indicators */}
          <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-[1.5rem]">
            <button 
              onClick={() => setStep(1)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase transition-all",
                step === 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              1. Intel
            </button>
            <button 
              onClick={() => setStep(2)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase transition-all",
                step === 2 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              2. Tactical Path
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Mission Callsign</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Navigation size={18} />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/20 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-muted-foreground/30"
                        placeholder="e.g. SKYLINE ATTACK"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Objective Intel</label>
                    <textarea
                      className="w-full px-4 py-4 rounded-2xl bg-muted/20 border border-border focus:border-primary/50 outline-none font-medium min-h-[100px] text-sm resize-none"
                      placeholder="What's the goal of this mission?"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Deployment</label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-3 rounded-2xl bg-muted/20 border border-border focus:border-primary/50 text-xs font-bold outline-none"
                        value={form.start_time}
                        onChange={e => setForm({ ...form, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Pack Size</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 rounded-2xl bg-muted/20 border border-border focus:border-primary/50 text-xs font-bold outline-none"
                        value={form.max_participants}
                        onChange={e => setForm({ ...form, max_participants: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Assigned Community</label>
                    <select
                      className="w-full px-4 py-4 rounded-2xl bg-muted/20 border border-border focus:border-primary/50 outline-none font-bold text-sm appearance-none cursor-pointer"
                      value={form.community_id}
                      onChange={e => setForm({ ...form, community_id: e.target.value })}
                    >
                      <option value="">Select Headquarters</option>
                      {communities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Configure Tactical Path
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="p-5 rounded-[1.5rem] bg-muted/30 border border-border/50 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest">Tactical Waypoint Log</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Confirmed: {2 + stops.length}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Start */}
                      <div className="flex items-center gap-4 relative group">
                        <div className="h-8 w-8 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center justify-center text-[10px] font-black text-white shrink-0">S</div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Mission Start</p>
                           <p className="text-xs font-bold truncate text-foreground/80">{route.start_location.name || 'Set on map'}</p>
                        </div>
                      </div>

                      {/* Stops */}
                      {stops.map((s, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg",
                            stopTypes.find(st => st.value === s.type)?.bg || "bg-primary/20"
                          )} style={{ backgroundColor: stopTypes.find(st => st.value === s.type)?.color }}>
                            {stopTypes.find(st => st.value === s.type)?.icon({ size: 14 })}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: stopTypes.find(st => st.value === s.type)?.color }}>
                               {s.type} Point
                             </p>
                             <input 
                               className="text-xs font-bold bg-transparent border-none outline-none flex-1 w-full"
                               value={s.name}
                               onChange={e => {
                                 const newStops = [...stops]
                                 newStops[i].name = e.target.value
                                 setStops(newStops)
                               }}
                             />
                          </div>
                          <button onClick={() => setStops(stops.filter((_, idx) => idx !== i))}>
                            <Trash2 size={14} className="text-destructive/50 hover:text-destructive transition-colors" />
                          </button>
                        </div>
                      ))}

                      {/* End */}
                      <div className="flex items-center gap-4 group">
                        <div className="h-8 w-8 rounded-full bg-red-500 shadow-lg shadow-red-500/20 flex items-center justify-center text-[10px] font-black text-white shrink-0">E</div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-0.5">Mission End</p>
                           <p className="text-xs font-bold truncate text-foreground/80">{route.end_location.name || 'Set on map'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <Info size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
                    <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold">
                      Use the target scanner on the map to find locations. Confirm each point as Start, End, or Stop to build your tactical path.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setStep(1)}
                    className="py-4 rounded-2xl bg-muted text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                  >
                    Return to Intel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !route.start_location.name || !route.end_location.name}
                    className="py-4 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? "Deploying..." : "Deploy Mission"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Panel: Tactical Map */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 min-h-[600px] lg:min-h-0"
      >
        <PremiumMap 
          center={[19.0760, 72.8777]} // Mumbai
          onConfirmPoint={handleConfirmPoint}
          markers={markers}
        />
      </motion.div>
    </div>
  )
}
