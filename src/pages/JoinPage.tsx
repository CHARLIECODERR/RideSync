import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useRideStore from '@/features/rides/store/rideStore'
import useCommunityStore from '@/features/community/store/communityStore'
import { cn } from '@/lib/utils'

export default function JoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { joinRide } = useRideStore()
  const { joinByCode } = useCommunityStore()
  
  const initialType = searchParams.get('type') === 'community' ? 'community' : 'ride'
  const initialCode = searchParams.get('code') || ''
  
  const [type, setType] = useState<'ride' | 'community'>(initialType)
  const [code, setCode] = useState(initialCode)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [resultData, setResultData] = useState<any>(null)

  useEffect(() => {
    if (initialCode) {
      handleJoin(initialCode, initialType)
    }
  }, [])

  const handleJoin = async (targetCode: string, targetType: 'ride' | 'community') => {
    if (!targetCode) return
    
    setStatus('loading')
    setErrorMessage('')
    
    try {
      if (targetType === 'ride') {
        const ride = await joinRide(targetCode)
        if (ride) {
          setResultData(ride)
          setStatus('success')
          setTimeout(() => navigate(`/ride/${ride.id}`), 2000)
        } else {
          throw new Error('Ride authentication failed. Intel not found.')
        }
      } else {
        const community = await joinByCode(targetCode)
        if (community) {
          setResultData(community)
          setStatus('success')
          setTimeout(() => navigate(`/communities/${community.id}`), 2000)
        } else {
          throw new Error('Community identification failed. Brotherhood not found.')
        }
      }
    } catch (err: any) {
      console.error('Join failed', err)
      setStatus('error')
      setErrorMessage(err.response?.data?.error || err.message || 'Mission authentication failed.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-12 text-center space-y-6"
            >
              <div className="mx-auto w-20 h-20 bg-emerald-500 flex items-center justify-center rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Access Granted</h2>
                <p className="text-emerald-500/60 font-bold uppercase text-xs tracking-widest">You have successfully joined the {type === 'ride' ? 'ride' : 'community'}</p>
              </div>
              <div className="pt-4">
                <p className="text-white font-black uppercase italic text-xl">{resultData?.name}</p>
                <div className="mt-8 flex justify-center">
                  <Loader2 className="animate-spin text-emerald-500" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border border-white/5 p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={120} />
              </div>

              <div className="space-y-2 relative z-10">
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">External Link <br/><span className="text-primary italic">Authentication</span></h1>
                <p className="text-white/20 font-black uppercase text-[10px] tracking-[0.4em]">Establish connection via mission code</p>
              </div>

              <div className="flex gap-4 relative z-10">
                <button 
                  onClick={() => setType('ride')}
                  className={cn(
                    "flex-1 py-4 border font-black uppercase tracking-widest text-[10px] transition-all skew-x-[-10deg]",
                    type === 'ride' ? "bg-primary border-primary text-black" : "border-white/10 text-white/40 hover:border-white/30"
                  )}
                >
                  <div className="skew-x-[10deg] flex items-center justify-center gap-2">
                    <MapPin size={14} /> Ride Mission
                  </div>
                </button>
                <button 
                  onClick={() => setType('community')}
                  className={cn(
                    "flex-1 py-4 border font-black uppercase tracking-widest text-[10px] transition-all skew-x-[-10deg]",
                    type === 'community' ? "bg-primary border-primary text-black" : "border-white/10 text-white/40 hover:border-white/30"
                  )}
                >
                  <div className="skew-x-[10deg] flex items-center justify-center gap-2">
                    <Users size={14} /> Community Cell
                  </div>
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Access Code</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="ENTER 6-DIGIT CODE"
                      className="w-full bg-white/5 border border-white/10 px-6 py-5 text-xl font-black tracking-[0.5em] text-white focus:outline-none focus:border-primary transition-all uppercase placeholder:text-white/5 focus:bg-white/10"
                    />
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">{errorMessage}</p>
                  </motion.div>
                )}

                <button 
                  disabled={code.length < 4 || status === 'loading'}
                  onClick={() => handleJoin(code, type)}
                  className={cn(
                    "w-full py-6 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all",
                    code.length >= 4 
                      ? "bg-white text-black hover:bg-primary shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  )}
                >
                  {status === 'loading' ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Verify Credentials <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">Encrypted end-to-end mission authentication</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
