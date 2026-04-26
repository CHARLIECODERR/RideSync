import { useState } from 'react'
import useCommunityStore from '../store/communityStore'
import { Shield, ShieldCheck, User, MoreVertical, Trash2, Zap, ArrowRight, UserPlus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MemberManagement() {
  const { activeMembers, updateMemberRole, removeMember, addMemberByEmail, isAdmin, isArranger, isLoading: isStoreLoading } = useCommunityStore()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [showInductModal, setShowInductModal] = useState(false)
  const [inductEmail, setInductEmail] = useState('')
  const [inductError, setInductError] = useState<string | null>(null)
  const [isInducting, setIsInducting] = useState(false)

  const handleRoleChange = async (userId: string, newRole: 'Admin' | 'Arranger' | 'Rider') => {
    setIsUpdating(userId)
    await updateMemberRole(userId, newRole)
    setIsUpdating(null)
  }

  const handleRemove = async (userId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the brotherhood?`)) {
      setIsUpdating(userId)
      await removeMember(userId)
      setIsUpdating(null)
    }
  }

  const handleInduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setInductError(null)
    setIsInducting(true)
    try {
      await addMemberByEmail(inductEmail)
      setShowInductModal(false)
      setInductEmail('')
    } catch (err: any) {
      setInductError(err.response?.data?.error || err.message || 'Failed to induct member')
    } finally {
      setIsInducting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <ShieldCheck size={14} className="text-saffron" />
      case 'Arranger': return <Zap size={14} className="text-saffron" />
      default: return <User size={14} className="text-white/20" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return "text-saffron border-saffron/30"
      case 'Arranger': return "text-saffron border-saffron/30"
      default: return "text-white/40 border-white/10"
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">The <span className="text-saffron">Brotherhood.</span></h3>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{activeMembers.length} ACTIVE RIDERS</p>
        </div>
      </div>

      <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
        {activeMembers.map((member) => (
          <div key={member.user_id} className="p-6 hover:bg-white/[0.02] transition-all flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-saffron italic relative overflow-hidden group-hover:border-saffron/50 transition-colors duration-500">
                {member.user_profile?.avatar_url ? (
                  <img src={member.user_profile.avatar_url} alt="" className="h-full w-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                ) : (
                  <span className="relative z-10">{member.user_profile?.name?.charAt(0) || 'U'}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
              </div>
              
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-xs uppercase tracking-widest text-white/80 flex items-center gap-2">
                  {member.user_profile?.name || 'Unknown Rider'}
                  <div className="opacity-40">{getRoleIcon(member.role)}</div>
                </span>
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  {member.role} • JOINED {new Date(member.joined_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isArranger() && member.role !== 'Admin' && (
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                  {isUpdating === member.user_id ? (
                    <Loader2 size={16} className="animate-spin text-saffron" />
                  ) : (
                    <>
                      <select
                        className="bg-black border border-white/10 rounded-none text-[10px] font-black uppercase tracking-widest py-1 px-3 outline-none focus:border-saffron transition-all appearance-none cursor-pointer"
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value as any)}
                      >
                        <option value="Rider">RIDER</option>
                        <option value="Arranger">ARRANGER</option>
                        <option value="Admin">ADMIN</option>
                      </select>
                      <button 
                        onClick={() => handleRemove(member.user_id, member.user_profile?.name || 'this rider')}
                        className="p-2 hover:bg-red-900 text-white/10 hover:text-white transition-all border border-transparent hover:border-red-500/50"
                        title="Remove Member"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              )}
              
              {(!isArranger() || member.role === 'Admin') && (
                <div className={cn(
                  "px-3 py-1 border text-[9px] font-black uppercase tracking-widest transition-all",
                  getRoleColor(member.role)
                )}>
                  {member.role}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeMembers.length === 0 && (
        <div className="p-16 text-center space-y-4 bg-white/[0.01]">
          <div className="h-12 w-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white/10">
            <User size={24} />
          </div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">No members in this club.</p>
        </div>
      )}

      {isArranger() && (
        <div className="p-6 bg-white/[0.02] border-t border-white/5">
          <button 
            onClick={() => setShowInductModal(true)}
            className="w-full py-4 border border-dashed border-white/10 hover:border-saffron/50 hover:bg-saffron/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-saffron transition-all flex items-center justify-center gap-2 group"
          >
             <UserPlus size={14} /> Induct New Member <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Induct Modal */}
      {showInductModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-950 border border-saffron/30 p-10 space-y-8 relative shadow-2xl">
            <button 
              onClick={() => setShowInductModal(false)}
              className="absolute top-6 right-6 text-white/20 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="space-y-2">
              <h4 className="text-2xl font-black uppercase italic tracking-tighter">Induct <span className="text-saffron">Rider.</span></h4>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Add a member via their registered email.</p>
            </div>

            <form onSubmit={handleInduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">User Email</label>
                <input 
                  type="email"
                  required
                  value={inductEmail}
                  onChange={(e) => setInductEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-black border border-white/10 px-5 py-4 font-bold text-sm outline-none focus:border-saffron transition-all uppercase"
                />
              </div>

              {inductError && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{inductError}</p>
              )}

              <button 
                type="submit"
                disabled={isInducting}
                className="w-full py-4 bg-saffron text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                {isInducting ? <Loader2 className="animate-spin" size={16} /> : 'Establish Membership'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

