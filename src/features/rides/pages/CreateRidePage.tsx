import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Plus, Trash2, Fuel, Coffee, PauseCircle,
  ArrowRight, Route
} from 'lucide-react'
import useRideStore from '@/features/rides/store/rideStore'
import useCommunityStore from '@/features/community/store/communityStore'
import { cn } from '@/lib/utils'

interface Stop {
  id: string
  name: string
  type: 'fuel' | 'food' | 'break' | 'other'
  lat: string
  lng: string
  order: number
}

export default function CreateRidePage() {
  const navigate = useNavigate()
  const { createRide } = useRideStore()
  const { communities } = useCommunityStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    community_id: '',
    community_name: '',
    start_time: '',
    max_participants: 15,
    distance: '',
    estimated_duration: '',
    start_name: '',
    start_lat: '',
    start_lng: '',
    end_name: '',
    end_lat: '',
    end_lng: '',
  })

  const [stops, setStops] = useState<Stop[]>([])

  const stopTypes = [
    { value: 'fuel' as const, label: 'Fuel', icon: Fuel, color: 'text-amber-500', bg: 'bg-amber-50' },
    { value: 'food' as const, label: 'Food', icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: 'break' as const, label: 'Break', icon: PauseCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  ]

  const addStop = () => {
    setStops([...stops, {
      id: 'stop-' + Date.now(),
      name: '',
      type: 'break',
      lat: '',
      lng: '',
      order: stops.length + 1,
    }])
  }

  const updateStop = (index: number, key: keyof Stop, value: string) => {
    const updated = [...stops]
    updated[index] = { ...updated[index], [key]: value } as Stop
    setStops(updated)
  }

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const comm = communities.find(c => c.id === e.target.value)
    setForm({
      ...form,
      community_id: e.target.value,
      community_name: comm?.name || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const rideData = {
      ...form,
      stops: stops.map(s => ({
        ...s,
        lat: parseFloat(s.lat) || 0,
        lng: parseFloat(s.lng) || 0,
      })),
      organizer: 'Alex Rider',
      organizer_id: 'user-1',
      route: {
        start: { lat: parseFloat(form.start_lat) || 34.02, lng: parseFloat(form.start_lng) || -118.49, name: form.start_name },
        end: { lat: parseFloat(form.end_lat) || 34.28, lng: parseFloat(form.end_lng) || -119.29, name: form.end_name },
      },
    }

    const newRide = await createRide(rideData as any)
    setIsSubmitting(false)

    if (newRide) {
      navigate(`/rides`)
    }
  }

  const getStopConfig = (type: string) => {
    return stopTypes.find(s => s.value === type) || stopTypes[2]
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Create New Ride</h1>
        <p className="text-muted-foreground text-lg">Plan your next adventure with waypoints and stops.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Basic Info */}
        <div className="bg-card border rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Route size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Ride Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ride Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                placeholder="e.g. Coastal Highway Run"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium min-h-[120px]"
                placeholder="Describe the ride experience..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Community</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium appearance-none"
                value={form.community_id}
                onChange={handleCommunityChange}
                required
              >
                <option value="">Select community</option>
                {communities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Start Time</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Max Riders</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                min="2"
                max="100"
                value={form.max_participants}
                onChange={e => setForm({ ...form, max_participants: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Est. Distance</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                placeholder="e.g. 120 km"
                value={form.distance}
                onChange={e => setForm({ ...form, distance: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="bg-card border rounded-3xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Route & Waypoints</h2>
          </div>

          <div className="relative space-y-6">
            <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-primary via-muted to-muted rounded-full" />
            
            {/* Start point */}
            <div className="relative pl-14 pb-8">
              <div className="absolute left-2.5 top-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-background shadow-lg shadow-primary/20">
                <div className="h-3 w-3 rounded-full bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-primary uppercase tracking-tight">Starting Point</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-primary transition-all outline-none font-medium"
                  placeholder="Where does the ride start?"
                  value={form.start_name}
                  onChange={e => setForm({ ...form, start_name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Waypoints */}
            {stops.map((stop, i) => {
              const config = getStopConfig(stop.type)
              const StopIcon = config.icon
              return (
                <div key={stop.id} className="relative pl-14 pb-8 group">
                  <div className={cn("absolute left-4 top-1 h-5 w-5 rounded-full flex items-center justify-center ring-4 ring-background shadow-md", config.bg, config.color)}>
                    <StopIcon size={12} />
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 hover:border-primary/30 transition-all space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <input
                        type="text"
                        className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/50 border-b border-transparent focus:border-primary/50 py-1"
                        placeholder="Stop name (e.g. Lunch Break)"
                        value={stop.name}
                        onChange={e => updateStop(i, 'name', e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <select
                          className="bg-card border rounded-lg text-xs font-bold py-1 px-2 outline-none"
                          value={stop.type}
                          onChange={e => updateStop(i, 'type', e.target.value as any)}
                        >
                          {stopTypes.map(st => (
                            <option key={st.value} value={st.value}>{st.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => removeStop(i)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add stop button */}
            <div className="relative pl-14 pb-8">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/5 border border-primary/20 border-dashed transition-all"
                onClick={addStop}
              >
                <Plus size={16} />
                Add Waypoint
              </button>
            </div>

            {/* End point */}
            <div className="relative pl-14">
              <div className="absolute left-2.5 top-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-8 ring-background">
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-tight">Final Destination</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-primary transition-all outline-none font-medium"
                  placeholder="Where does the ride end?"
                  value={form.end_name}
                  onChange={e => setForm({ ...form, end_name: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button 
            type="button" 
            className="px-6 py-3 rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-all" 
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Planning Ride..." : "Create Ride"}
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </div>
      </form>
    </div>
  )
}
