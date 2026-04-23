import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Users, MapPin, Calendar, Shield, 
  Settings, ArrowLeft, Plus, Zap, LogOut, ShieldCheck, ArrowRight
} from 'lucide-react'
import useCommunityStore from '../store/communityStore'
import useRideStore from '@/features/rides/store/rideStore'
import MemberManagement from '../components/MemberManagement'
import { cn } from '@/lib/utils'

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    activeCommunity, 
    isLoading: commsLoading, 
    loadCommunity, 
    isAdmin, 
    isArranger, 
    userRole,
    joinCommunity,
    leaveCommunity,
    error: storeError
  } = useCommunityStore()

  const { rides, fetchRides, getRidesByCommunity } = useRideStore()
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    if (id) {
      loadCommunity(id)
      fetchRides()
    }
  }, [id, loadCommunity, fetchRides])

  const communityRides = id ? getRidesByCommunity(id) : []
  const isLoading = commsLoading || !id

  const handleJoin = async () => {
    if (!id) return
    setIsJoining(true)
    await joinCommunity(id)
    setIsJoining(false)
  }

  const handleLeave = async () => {
    if (!id) return
    if (window.confirm("Are you sure you want to leave this brotherhood? Your access to club rides will be revoked.")) {
      setIsJoining(true)
      await leaveCommunity(id)
      setIsJoining(false)
    }
  }

  if (isLoading && !activeCommunity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="h-16 w-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="font-black text-white/20 uppercase tracking-[0.5em] animate-pulse">Loading Hub...</p>
      </div>
    )
  }

  if (storeError || !activeCommunity) return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-4xl font-black uppercase italic">{storeError ? "Access Denied." : "Abandoned Road."}</h2>
      <p className="text-white/40">{storeError || "This community no longer exists in our records."}</p>
      <button onClick={() => navigate('/communities')} className="text-saffron font-black uppercase tracking-widest text-sm underline underline-offset-8">Return to Garage</button>
    </div>
  )

  const isMember = userRole !== null

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 selection:bg-saffron/30">
      {/* Header / Hero Area */}
      <div className="flex flex-col gap-10">
        <button 
          onClick={() => navigate('/communities')}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-saffron transition-colors w-fit group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to The Garage
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-white/10">
          <div className="flex items-center gap-10">
            <div className="h-32 w-32 bg-white/5 border-2 border-white/10 flex items-center justify-center text-5xl font-black text-saffron italic shadow-[0_0_50px_-10px_rgba(183,65,14,0.3)] shrink-0">
              {activeCommunity.name.charAt(0)}
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">{activeCommunity.name}</h1>
                {isMember && (
                  <div className={cn(
                    "px-4 py-1.5 border text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-2",
                    isAdmin() ? "bg-saffron/20 border-saffron text-saffron shadow-[0_0_20px_rgba(183,65,14,0.2)]" : "bg-white/5 border-white/20 text-white/60"
                  )}>
                    {isAdmin() ? <ShieldCheck size={12} /> : <Users size={12} />}
                    {userRole} Member
                  </div>
                )}
              </div>
              <p className="text-white/40 text-xl font-bold max-w-3xl leading-relaxed italic border-l-4 border-saffron/30 pl-8">
                {activeCommunity.description || "A silent pact among riders. Forged in steel, tested on asphalt."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {!isMember ? (
              <button 
                onClick={handleJoin}
                disabled={isJoining}
                className="group relative flex items-center gap-4 px-10 py-6 bg-saffron text-white font-black uppercase tracking-tighter hover:bg-orange-600 transition-all skew-x-[-15deg] shadow-2xl shadow-saffron/20 disabled:opacity-50"
              >
                <div className="skew-x-[15deg] flex items-center gap-2">
                  <Plus size={20} /> Claim Your Patch
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                {isArranger() && (
                  <button className="group relative flex items-center gap-4 px-8 py-4 bg-white/5 border-2 border-white/10 text-white font-black uppercase tracking-tighter hover:bg-white/10 transition-all skew-x-[-15deg]">
                    <div className="skew-x-[15deg] flex items-center gap-2">
                      <Zap size={18} className="text-saffron" /> Organize Big Ride
                    </div>
                  </button>
                )}
                <button className="group relative flex items-center gap-4 px-8 py-4 bg-saffron text-white font-black uppercase tracking-tighter hover:bg-orange-600 transition-all skew-x-[-15deg]">
                  <div className="skew-x-[15deg] flex items-center gap-2">
                    <Plus size={18} /> New Event
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Intel Column */}
        <div className="lg:col-span-2 space-y-16">
          {/* Stats Grid - Industrial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-white/5 border border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="p-10 space-y-2">
              <div className="text-primary font-black text-[10px] uppercase tracking-[0.5em] flex items-center gap-3">
                <Users size={14} /> Members
              </div>
              <div className="text-5xl font-black italic tracking-tighter">{activeCommunity.members_count || 0}</div>
            </div>
            <div className="p-10 space-y-2">
              <div className="text-primary font-black text-[10px] uppercase tracking-[0.5em] flex items-center gap-3">
                <Calendar size={14} /> Total Rides
              </div>
              <div className="text-5xl font-black italic tracking-tighter">{activeCommunity.rides_count || 0}</div>
            </div>
          </div>

          {/* Ride Feed Placeholder - Rugged Empty State */}
          <div className="space-y-8">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Upcoming <span className="text-primary">Rides.</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityRides.length > 0 ? (
                communityRides.map(ride => (
                  <div 
                    key={ride.id}
                    className="p-6 bg-white/5 border border-white/10 hover:border-saffron/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/ride/${ride.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                       <span className={cn(
                        "px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                        ride.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-white/10 text-white/40"
                      )}>
                        {ride.status}
                      </span>
                      <span className="font-mono text-[9px] text-white/20">{ride.ride_code}</span>
                    </div>
                    <h4 className="text-xl font-black uppercase italic group-hover:text-saffron transition-colors">{ride.name}</h4>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                      <span>{ride.distance} • {ride.participants} RIDERS</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-24 bg-white/5 border-2 border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center text-white/10">
                    <Calendar size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">No Rides Logged</h4>
                    <p className="text-white/40 text-sm font-bold max-w-xs mx-auto uppercase tracking-wide">Be the one to signal the pack. Start an expedition now.</p>
                  </div>
                  {isMember && (
                    <button 
                      onClick={() => navigate('/create-ride')}
                      className="px-6 py-2 bg-saffron text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
                    >
                      Schedule Start
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tactical Intel Column (Sidebar) */}
        <div className="space-y-12">
          {/* Members Component */}
          <MemberManagement />

          {/* Tactical Actions */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-saffron uppercase tracking-[0.5em] ml-2">Tactical Info</h4>
            <div className="bg-[#0A0A0A] border border-white/5 p-8 space-y-6">
              {isMember && (
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Road Permissions</div>
                  <ul className="space-y-2 text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                    <li className="flex items-center gap-2"><div className="h-1 w-1 bg-saffron" /> Can join expeditions</li>
                    <li className="flex items-center gap-2"><div className="h-1 w-1 bg-saffron" /> Access club intel</li>
                    {isArranger() && <li className="flex items-center gap-2"><div className="h-1 w-1 bg-saffron" /> Can lead the pack</li>}
                  </ul>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 space-y-3">
                {isAdmin() && (
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all group">
                    <span className="flex items-center gap-2"><Settings size={14} className="text-saffron" /> Hub Settings</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                {isMember && !isAdmin() && (
                  <button 
                    onClick={handleLeave}
                    disabled={isJoining}
                    className="w-full flex items-center justify-between px-4 py-3 bg-red-900/10 hover:bg-red-900 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group border border-red-900/20"
                  >
                    <span className="flex items-center gap-2"><LogOut size={14} /> Leave Brotherhood</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
