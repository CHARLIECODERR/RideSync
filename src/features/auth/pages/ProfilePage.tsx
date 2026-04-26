import { User, Shield, Settings, MapPin, Route, CheckCircle2 as CheckIcon, X, Save } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useRideStore from '@/features/rides/store/rideStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const { rides } = useRideStore()
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(user?.name || '')
  const [isSaving, setIsSaving] = useState(false)

  const completedRides = rides.filter(r => r.status === 'Completed').length

  const handleSave = async () => {
    if (!newName.trim()) return
    setIsSaving(true)
    try {
      await updateProfile({ name: newName })
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Profile Info */}
        <div className="w-full md:w-80 space-y-8 shrink-0">
          <div className="relative group">
            <div className="h-80 w-full bg-zinc-950 border border-white/5 flex items-center justify-center text-8xl font-black text-saffron italic relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]" />
               <span className="relative z-10">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-saffron text-white flex items-center justify-center shadow-2xl skew-x-[-10deg]">
               <div className="skew-x-[10deg]"><Shield size={24} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Update Identity</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-black uppercase tracking-tighter outline-none focus:border-saffron/50 transition-all"
                    placeholder="Enter new name"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 py-3 bg-saffron text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? "Saving..." : <><Save size={14} /> Commit</>}
                    </button>
                    <button 
                      onClick={() => { setIsEditing(false); setNewName(user?.name || ''); }}
                      className="p-3 bg-white/5 border border-white/10 text-white/40 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter">{user?.name}</h1>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-sm text-white/40 font-bold leading-relaxed italic border-l-2 border-saffron/30 pl-4">
              "The road has no prejudice. It tests every man and machine equally. Born to ride, forced to work."
            </p>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
              <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" /> Operational Tuning
            </button>
          )}
        </div>

        {/* Stats & History */}
        <div className="flex-1 space-y-12 w-full">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/5 border border-white/10">
              <div className="p-8 space-y-2">
                 <div className="text-saffron font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-2">
                    <Route size={14} /> Missions
                 </div>
                 <div className="text-5xl font-black italic tracking-tighter">{rides.length}</div>
              </div>
              <div className="p-8 space-y-2">
                 <div className="text-saffron font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-2">
                    <CheckIcon size={14} /> Completed
                 </div>
                 <div className="text-5xl font-black italic tracking-tighter">{completedRides}</div>
              </div>
              <div className="p-8 space-y-2">
                 <div className="text-saffron font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-2">
                    <MapPin size={14} /> Road Score
                 </div>
                 <div className="text-5xl font-black italic tracking-tighter">842</div>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Mission <span className="text-saffron">Logs.</span></h3>
              <div className="space-y-2">
                 {rides.slice(0, 5).map(ride => (
                   <div key={ride.id} className="p-6 bg-zinc-950/50 border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                      <div className="space-y-1">
                         <h4 className="text-sm font-black uppercase italic tracking-widest group-hover:text-saffron transition-colors">{ride.name}</h4>
                         <p className="text-[10px] font-bold text-white/20 uppercase">{ride.status} • {ride.distance_km || 0} KM</p>
                      </div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                         {new Date(ride.start_time).toLocaleDateString()}
                      </div>
                   </div>
                 ))}
                 {rides.length === 0 && (
                   <div className="py-20 text-center border-2 border-white/5 border-dashed">
                      <p className="text-[10px] font-black text-white/20 uppercase">No mission records found in the vault.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
