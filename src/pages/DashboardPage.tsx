import { useNavigate } from 'react-router-dom'
import {
  Route, Users, Zap, TrendingUp,
  MapPin, Plus, Navigation, ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '@/features/auth/store/authStore'
import useRideStore from '@/features/rides/store/rideStore'
import useCommunityStore from '@/features/community/store/communityStore'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { rides, isLoading: ridesLoading } = useRideStore()
  const { communities, isLoading: commsLoading } = useCommunityStore()
  const navigate = useNavigate()

  const loading = ridesLoading || commsLoading

  const activeRides = rides.filter(r => r.status === 'Active')
  const plannedRides = rides.filter(r => r.status === 'Planned')
  const completedRides = rides.filter(r => r.status === 'Completed')

  const stats = [
    { icon: Route, label: 'Total Rides', value: rides.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Users, label: 'Communities', value: communities.length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Zap, label: 'Active Now', value: activeRides.length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: TrendingUp, label: 'Completed', value: completedRides.length, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Hero Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={item} className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic leading-none">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Rider'}</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">The road is calling. Your tactical summary is ready.</p>
        </motion.div>
        <motion.div variants={item} className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-tight"
            onClick={() => navigate('/create-ride')}
          >
            <Plus size={20} />
            <span>Create Mission</span>
          </button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)
        ) : (
          stats.map((stat, i) => (
            <motion.div 
              key={i} 
              variants={item}
              className="group p-6 rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all shadow-rugged"
            >
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={28} />
              </div>
              <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-10">
          {/* Active Rides */}
          <section className="space-y-6">
            <motion.div variants={item} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-2xl font-black tracking-tight uppercase italic">Active Operations</h2>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)
              ) : activeRides.length > 0 ? (
                activeRides.map(ride => (
                  <motion.div
                    key={ride.id}
                    variants={item}
                    className="group relative p-6 rounded-[2.5rem] bg-card backdrop-blur-xl border-2 border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer shadow-rugged"
                    onClick={() => navigate(`/ride/${ride.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE TRACKING
                      </span>
                    </div>
                    <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors uppercase italic">{ride.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-tighter">{ride.community_name}</p>
                    <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] font-black text-primary uppercase">
                      <span>ENGAGE TRACKER</span>
                      <ArrowRight size={14} />
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div variants={item} className="col-span-full p-12 rounded-[2.5rem] bg-muted/20 border-2 border-dashed border-border/50 text-center flex flex-col items-center justify-center gap-4">
                  <p className="text-xs font-black text-muted-foreground uppercase">No active operations currently detected.</p>
                </motion.div>
              )}
            </div>
          </section>

          {/* Upcoming Rides */}
          <section className="space-y-6">
            <motion.div variants={item} className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3">
                <Navigation size={24} className="text-primary" />
                Planned Routes
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)
              ) : plannedRides.length > 0 ? (
                plannedRides.map(ride => (
                  <motion.div
                    key={ride.id}
                    variants={item}
                    className="group p-6 rounded-[2.5rem] bg-card/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer shadow-rugged"
                    onClick={() => navigate(`/ride/${ride.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border/50">PLANNED</span>
                      <span className="font-mono text-[10px] font-bold text-primary/50">{ride.ride_code}</span>
                    </div>
                    <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors uppercase italic">{ride.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-tighter">{ride.community_name}</p>
                    <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase">
                      <span className="flex items-center gap-1.5"><Users size={14} /> {ride.participants} RIDERS</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {ride.distance}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div variants={item} className="col-span-full p-12 rounded-[2.5rem] bg-muted/20 border-2 border-dashed border-border/50 text-center">
                  <p className="text-xs font-black text-muted-foreground uppercase italic underline cursor-pointer" onClick={() => navigate('/create-ride')}>Click to initiate new mission</p>
                </motion.div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <motion.div variants={item} className="space-y-8">
          <section className="bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/50 p-6 shadow-rugged">
            <h3 className="text-xl font-black uppercase italic mb-6 tracking-tight">The Brotherhood</h3>
            <div className="space-y-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
              ) : communities.slice(0, 5).map(comm => (
                <div key={comm.id} className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/20 flex items-center gap-4 cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black">{comm.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase italic tracking-tight truncate">{comm.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{comm.members_count || 0} RIDERS</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </motion.div>
  )
}
