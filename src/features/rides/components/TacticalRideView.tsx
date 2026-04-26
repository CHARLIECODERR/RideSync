import { motion, AnimatePresence } from 'framer-motion'
import { 
  Navigation, X, AlertTriangle, 
  Zap, Fuel, Coffee, Milestone,
  ChevronUp, ChevronLeft, ChevronRight,
  Maximize2, Minimize2
} from 'lucide-react'
import useRideStore from '../store/rideStore'
import PremiumMap from './PremiumMap'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function TacticalRideView() {
  const { 
    activeRide, 
    currentUserLocation, 
    navigationMetadata, 
    setRideMode,
    endRide,
    otherRiders
  } = useRideStore()
  
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Auto-fullscreen request on component mount (browser permitting)
  useEffect(() => {
    if (document.documentElement.requestFullscreen) {
      // document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  if (!activeRide) return null

  const markers: any[] = [
    { 
      id: 'currentUser', 
      lat: currentUserLocation?.lat || 0, 
      lng: currentUserLocation?.lng || 0, 
      type: 'other' as const, 
      name: 'YOU' 
    },
    ...Object.values(otherRiders).map(r => ({
      id: r.userId,
      lat: r.location.lat,
      lng: r.location.lng,
      type: 'other' as const,
      name: r.name
    })),
    ...(activeRide.stops || []).map((s: any) => ({
      id: s.id,
      lat: s.location.lat,
      lng: s.location.lng,
      type: s.type,
      name: s.name
    }))
  ].filter(m => m.lat && m.lng)

  return (
    <div className="fixed inset-0 z-[9999] bg-background text-foreground overflow-hidden flex flex-col md:flex-row h-screen w-screen landscape:flex-row">
      {/* MAP - BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <PremiumMap 
          center={currentUserLocation ? [currentUserLocation.lat, currentUserLocation.lng] : [0, 0]}
          zoom={16}
          markers={markers}
          preloadedRoute={activeRide.route?.geometry}
          hideControls={true}
        />
      </div>

      {/* TOP HUD - NAVIGATION INSTRUCTIONS */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto flex items-stretch gap-4">
          {/* DIRECTION CARD */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              "flex-1 flex items-center gap-6 p-6 rounded-3xl backdrop-blur-2xl border-2 shadow-2xl transition-colors",
              navigationMetadata?.isOffRoute 
                ? "bg-red-500/90 border-red-400 animate-pulse" 
                : "bg-zinc-950/90 border-white/20"
            )}
          >
            <div className="p-4 rounded-2xl bg-white/10">
              {navigationMetadata?.isOffRoute ? (
                <AlertTriangle size={48} className="text-white animate-bounce" />
              ) : (
                <ChevronUp size={48} className="text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-[12px] font-black uppercase tracking-[0.4em] opacity-50">Current Instruction</p>
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
                {navigationMetadata?.nextInstruction || "LOCKING SATELLITE..."}
              </h2>
            </div>
          </motion.div>

          {/* DISTANCE/PROGRESS CARD */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-48 bg-zinc-950/90 backdrop-blur-2xl border-2 border-white/20 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl"
          >
             <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Remaining</p>
             <span className="text-3xl font-black italic text-primary">{activeRide.distance}</span>
          </motion.div>
        </div>
      </div>

      {/* LEFT HUD - TACTICAL STATS (SPEED) */}
      <div className="absolute left-6 bottom-6 z-10 p-4 pointer-events-none">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-zinc-950/90 backdrop-blur-2xl border-2 border-white/20 p-8 rounded-[3rem] flex flex-col items-center shadow-2xl"
        >
          <div className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-2">Speed</div>
          <div className="text-7xl font-black italic tracking-tighter tabular-nums leading-none">
            {navigationMetadata?.speed || 0}
          </div>
          <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">KM/H</div>
        </motion.div>
      </div>

      {/* RIGHT HUD - CONTROLS & STOPS */}
      <div className="absolute right-6 bottom-6 z-10 flex flex-col gap-4 pointer-events-auto">
        {/* Next Stops Quick View */}
        <div className="flex gap-3">
           {(activeRide.stops || []).slice(0, 2).map((stop: any) => (
             <div key={stop.id} className="p-4 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  {stop.type === 'fuel' ? <Fuel size={14} /> : <Coffee size={14} />}
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase">Next Stop</p>
                  <p className="text-[11px] font-bold uppercase truncate max-w-[80px]">{stop.name}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Action Bar */}
        <div className="flex gap-4">
          <button 
            onClick={() => endRide(activeRide.id)}
            className="h-16 flex-1 px-8 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95"
          >
            <X size={20} /> Abort Ride
          </button>
          
          <button 
            onClick={() => setRideMode(false)}
            className="h-16 px-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest flex items-center gap-3 backdrop-blur-xl transition-all overflow-hidden relative group"
          >
            <span className="relative z-10">Exit HUD</span>
            <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        </div>
      </div>

      {/* LOGO OVERLAY */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 opacity-20 pointer-events-none">
        <div className="flex items-center gap-2">
           <Zap size={24} className="text-primary fill-primary" />
           <span className="text-xl font-black uppercase tracking-[0.4em] italic leading-none">RideSync</span>
        </div>
      </div>
    </div>
  )
}
