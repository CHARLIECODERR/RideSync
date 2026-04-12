import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Plus, Trash2, Fuel, Coffee, PauseCircle,
  ArrowRight, Route, Calendar, Users, Info, ChevronRight,
  ShieldCheck, Navigation, Zap
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

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/3 space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <ShieldCheck size={14} className="animate-pulse" /> Ride Setup
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none italic uppercase">Create a Ride</h1>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 shadow-rugged space-y-8">
          <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-[1.5rem]">
            <button onClick={() => setStep(1)} className={cn("flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase transition-all", step === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>1. Basics</button>
            <button onClick={() => form.name && form.community_id && setStep(2)} className={cn("flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase transition-all", step === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>2. Route</button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Ride Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-muted/20 border border-border focus:border-primary/50 outline-none font-bold" placeholder="Sunday Morning Cruise" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Description</label>
                    <textarea className="w-full px-6 py-4 rounded-2xl bg-muted/20 border border-border outline-none font-medium min-h-[100px] resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="datetime-local" className="w-full px-4 py-3 rounded-2xl bg-muted/20 border border-border outline-none text-xs font-bold" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                    <input type="number" className="w-full px-4 py-3 rounded-2xl bg-muted/20 border border-border outline-none text-xs font-bold" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: parseInt(e.target.value) })} />
                  </div>
                  <select className="w-full px-6 py-4 rounded-2xl bg-muted/20 border border-border outline-none font-bold text-sm" value={form.community_id} onChange={e => setForm({ ...form, community_id: e.target.value })}>
                    <option value="">Select a Community</option>
                    {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <button onClick={() => setStep(2)} disabled={!form.name || !form.community_id} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest transition-all">Set the Route <ChevronRight size={18} className="inline ml-2" /></button>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="p-5 rounded-[1.5rem] bg-muted/30 border border-border/50 space-y-4 shadow-inner text-xs font-bold">
                    <div className="flex items-center gap-4 text-blue-500 uppercase tracking-widest"><MapPin size={14} /> Start: {route.start_location.name || 'Set on map'}</div>
                    {stops.map((s, i) => {
                      const stopInfo = stopTypes.find(t => t.value === s.type)
                      const Icon = stopInfo?.icon || MapPin
                      return (
                        <div key={i} className="flex items-center justify-between text-muted-foreground gap-4 pl-6 border-l-2 border-border/30">
                          <span className="flex items-center gap-2 capitalize">
                            <Icon size={12} className="text-primary" />
                            {s.name}
                          </span>
                          <button onClick={() => setStops(stops.filter((_, idx) => idx !== i))}><Trash2 size={12} className="text-red-500" /></button>
                        </div>
                      )
                    })}
                    <div className="flex items-center gap-4 text-red-500 uppercase tracking-widest"><Navigation size={14} /> End: {route.end_location.name || 'Set on map'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setStep(1)} disabled={isSubmitting} className="py-4 rounded-2xl bg-muted text-[10px] font-black uppercase tracking-widest">Go Back</button>
                  <button onClick={handleSubmit} disabled={isSubmitting || !route.start_location.name || !route.end_location.name} className="py-4 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    {isSubmitting ? <><Zap size={14} className="animate-spin" /> {submissionStatus}</> : "Create Ride"}
                  </button>
                </div>
                {submissionError && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase">{submissionError}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 min-h-[600px] lg:min-h-0 bg-card rounded-[2.5rem] overflow-hidden border-2 border-border/50">
        <PremiumMap center={[19.0760, 72.8777]} onConfirmPoint={handleConfirmPoint} onRouteUpdate={handleRouteUpdate} markers={markers} />
      </motion.div>
    </div>
  )
}
