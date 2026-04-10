import { useNavigate } from 'react-router-dom'
import { Route, Users, MapPin, Clock, Calendar, ArrowRight, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import useRideStore, { Ride } from '@/features/rides/store/rideStore'
import { cn } from '@/lib/utils'

export default function RidesPage() {
  const { rides, fetchRides } = useRideStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Ride['status'] | 'all'>('all')

  useEffect(() => {
    fetchRides()
  }, [fetchRides])

  const filtered = filter === 'all'
    ? rides
    : rides.filter(r => r.status === filter)

  const statusFilters: (Ride['status'] | 'all')[] = ['all', 'Active', 'Planned', 'Draft', 'Completed']

  const getStatusConfig = (status: Ride['status']) => {
    switch (status) {
      case 'Active': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
      case 'Planned': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
      case 'Completed': return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' }
      case 'Draft': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' }
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">My Rides</h1>
        <p className="text-muted-foreground">Manage and track your riding adventures.</p>
      </div>

      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl w-fit border">
        <div className="px-3 text-muted-foreground">
          <Filter size={16} />
        </div>
        {statusFilters.map(s => (
          <button
            key={s}
            className={cn(
              "px-4 py-1.5 rounded-xl text-sm font-semibold transition-all",
              filter === s 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s}
            {s !== 'all' && (
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                filter === s ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                {rides.filter(r => r.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(ride => {
          const config = getStatusConfig(ride.status)
          return (
            <div
              key={ride.id}
              className={cn(
                "group relative bg-card border rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6",
                ride.status === 'Active' && "border-emerald-200 bg-emerald-50/10 shadow-lg shadow-emerald-500/5"
              )}
              onClick={() => navigate(`/ride/${ride.id}`)}
            >
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className={cn("hidden md:block w-1.5 self-stretch rounded-full", 
                  ride.status === 'Active' ? "bg-emerald-500" : 
                  ride.status === 'Planned' ? "bg-blue-500" : 
                  ride.status === 'Completed' ? "bg-slate-400" : "bg-amber-400"
                )} />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">{ride.name}</h3>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5", config.bg, config.text)}>
                      {ride.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {ride.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-none">{ride.community_name}</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground/80">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {formatDate(ride.start_time)}</span>
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-primary" /> {ride.participants}/{ride.max_participants}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {ride.distance}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {ride.estimated_duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 md:min-w-[120px]">
                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">{ride.ride_code}</span>
                <div className="h-10 w-10 rounded-full border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:translate-x-1 transition-all">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Route size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold italic">No rides found</h3>
            <p className="text-muted-foreground">Try a different filter or create a new ride.</p>
          </div>
          <button 
            className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
            onClick={() => navigate('/create-ride')}
          >
            Create Your First Ride
          </button>
        </div>
      )}
    </div>
  )
}
