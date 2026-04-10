import { useNavigate } from 'react-router-dom'
import {
  Route, Users, Zap, Clock, ArrowRight, TrendingUp,
  MapPin, Calendar, Plus, Compass
} from 'lucide-react'
import useAuthStore from '@/features/auth/store/authStore'
import useRideStore from '@/features/rides/store/rideStore'
import useCommunityStore from '@/features/community/store/communityStore'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { rides } = useRideStore()
  const { communities } = useCommunityStore()
  const navigate = useNavigate()

  const activeRides = rides.filter(r => r.status === 'Active')
  const plannedRides = rides.filter(r => r.status === 'Planned')
  const completedRides = rides.filter(r => r.status === 'Completed')

  const stats = [
    { 
      icon: Route, 
      label: 'Total Rides', 
      value: rides.length, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      icon: Users, 
      label: 'Communities', 
      value: communities.length, 
      color: 'text-cyan-600', 
      bg: 'bg-cyan-50' 
    },
    { 
      icon: Zap, 
      label: 'Active Now', 
      value: activeRides.length, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      icon: TrendingUp, 
      label: 'Completed', 
      value: completedRides.length, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
  ]

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Hero Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Good {getTimeOfDay()}, <span className="text-primary">{user?.name?.split(' ')[0] || 'Rider'}</span>
          </h1>
          <p className="text-lg text-muted-foreground">Ready for your next adventure? Here's your summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => navigate('/create-ride')}
          >
            <Plus size={20} />
            <span>New Ride</span>
          </button>
          <button 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border font-semibold hover:bg-muted transition-all"
            onClick={() => navigate('/join')}
          >
            <Compass size={20} />
            <span>Join Ride</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="group p-6 rounded-3xl bg-card border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
            <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Rides Sections */}
        <div className="xl:col-span-2 space-y-10">
          {/* Active Rides */}
          {activeRides.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-2xl font-bold tracking-tight">Active Rides</h2>
                </div>
                <button 
                  className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                  onClick={() => navigate('/rides')}
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRides.map(ride => (
                  <div
                    key={ride.id}
                    className="group relative p-6 rounded-3xl bg-card border-2 border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
                    onClick={() => navigate(`/ride/${ride.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{ride.ride_code}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{ride.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{ride.community_name}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Users size={14} /> {ride.participants}/{ride.max_participants}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {ride.distance}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {ride.estimated_duration}</span>
                    </div>
                    <div className="mt-5 pt-4 border-t flex items-center justify-between text-xs font-bold text-primary group-hover:gap-2 transition-all">
                      <span>OPEN REAL-TIME TRACKER</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Rides */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Calendar size={24} className="text-primary" />
                Upcoming
              </h2>
              <button 
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                onClick={() => navigate('/rides')}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {plannedRides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plannedRides.map(ride => (
                  <div
                    key={ride.id}
                    className="group p-6 rounded-3xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/ride/${ride.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                        Planned
                      </span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{ride.ride_code}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{ride.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{ride.community_name}</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar size={14} className="text-primary" />
                        {formatDate(ride.start_time)}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Users size={14} /> {ride.participants}/{ride.max_participants}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {ride.distance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-muted/30 border-2 border-dashed border-muted text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Route size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">No upcoming rides</h3>
                  <p className="text-muted-foreground">Plan your next adventure or join an existing ride.</p>
                </div>
                <button 
                  className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold"
                  onClick={() => navigate('/create-ride')}
                >
                  Create a Ride
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar content */}
        <div className="space-y-8">
          {/* Communities */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Your Communities</h2>
            </div>
            <div className="space-y-3">
              {communities.slice(0, 4).map(comm => (
                <div
                  key={comm.id}
                  className="group p-4 rounded-2xl bg-card border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer flex items-center gap-4"
                  onClick={() => navigate('/communities')}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                    {comm.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{comm.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{comm.members} members · {comm.rides} rides</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    comm.role === 'Admin' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {comm.role}
                  </span>
                </div>
              ))}
            </div>
            <button 
              className="w-full py-3 rounded-2xl border-2 border-dashed border-muted text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/50 transition-all"
              onClick={() => navigate('/communities')}
            >
              Browse All Communities
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
