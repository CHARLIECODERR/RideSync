import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Plus, Globe, ArrowRight, Shield, X, Zap, AlertTriangle } from 'lucide-react'
import useCommunityStore from '../store/communityStore'
import { cn } from '@/lib/utils'

export default function CommunitiesPage() {
  const { communities, isLoading, fetchCommunities, createCommunity } = useCommunityStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchCommunities()
  }, [fetchCommunities])

  const [createError, setCreateError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setIsSubmitting(true)

    try {
      const community = await createCommunity(newName, newDesc)
      if (community) {
        setIsCreateOpen(false)
        setNewName('')
        setNewDesc('')
        navigate(`/communities/${community.id}`)
      } else {
        setCreateError("Failed to establish club. Please check your connection and try again.")
      }
    } catch (err: any) {
      setCreateError(err.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = communities.filter(c => 
    c.name.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(debouncedTerm.toLowerCase())
  )

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 selection:bg-saffron/30">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-saffron/10 border border-saffron/20 text-saffron text-[10px] font-black uppercase tracking-[0.3em] italic">
            <Zap size={12} /> The Global Garage
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            The <span className="text-saffron">Clubs.</span>
          </h1>
          <p className="text-white/40 text-xl font-bold max-w-xl">Find your tribe. Join a legacy or establish your own brotherhood on the asphalt.</p>
        </div>
        
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="group relative flex items-center gap-4 px-8 py-5 bg-saffron text-white font-black uppercase tracking-tighter hover:bg-orange-600 transition-all skew-x-[-15deg] shadow-2xl shadow-saffron/20"
        >
          <div className="skew-x-[15deg] flex items-center gap-2">
            <Plus size={20} /> Establish Club
          </div>
        </button>
      </div>

      {/* Search Bar - Rugged Style */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-white/20 group-focus-within:text-saffron transition-colors" size={24} />
        </div>
        <input 
          type="text"
          className="w-full pl-16 pr-8 py-6 bg-zinc-900/50 border-2 border-white/5 focus:border-saffron/50 outline-none font-black uppercase tracking-widest text-lg transition-all placeholder:text-white/10 italic"
          placeholder="SEARCH BY CLUB NAME OR VIBE..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 border border-white/10 text-[10px] font-black text-white/20 tracking-widest">
          {filtered.length} RESULTS
        </div>
      </div>

      {/* Community Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] bg-zinc-900/50 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/5 p-[1px]">
          {filtered.map(comm => (
            <div 
              key={comm.id}
              className="group relative h-[400px] bg-black overflow-hidden cursor-pointer flex flex-col justify-end p-10 transition-all"
              onClick={() => navigate(`/communities/${comm.id}`)}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-zinc-900 opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
              
              {/* Card Content */}
              <div className="relative z-20 space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="h-16 w-16 bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-saffron italic group-hover:bg-saffron group-hover:text-white transition-all duration-500 shadow-2xl">
                  {comm.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{comm.name}</h3>
                  <div className="flex items-center gap-3 text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">
                    <span>{comm.members_count || 0} RIDERS</span>
                    <span className="h-1 w-1 rounded-full bg-saffron" />
                    <span>{comm.rides_count || 0} EXPEDITIONS</span>
                  </div>
                </div>
                <p className="text-sm text-white/40 font-bold line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 leading-relaxed">
                  {comm.description || "A dedicated brotherhood forged on the long roads of Bharat."}
                </p>
                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  <div className="inline-flex items-center gap-2 text-saffron text-xs font-black uppercase tracking-widest italic group/link">
                    Enter Headquarters <ArrowRight size={14} className="group-hover/link:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rotate-45 translate-x-12 -translate-y-12" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="py-24 flex flex-col items-center text-center space-y-8 border-2 border-white/5 border-dashed">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
            <Globe size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">No Clubs Found</h3>
            <p className="text-white/40 font-bold max-w-xs mx-auto">The road is empty. Start your own legacy and lead the pack.</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
          >
            Establish New Club
          </button>
        </div>
      )}

      {/* Create Modal - Custom Rugged */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-zinc-950 border border-saffron/30 shadow-[0_30px_100px_-20px_rgba(183,65,14,0.3)] relative overflow-hidden">
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            <div className="p-12 space-y-10 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Establish <span className="text-saffron">Club.</span></h2>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Define your brotherhood's legacy.</p>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 hover:bg-white/5 text-white/20 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                {createError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertTriangle className="inline-block mr-2" size={14} /> {createError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-saffron uppercase tracking-[0.4em] ml-1">Club Name</label>
                  <input 
                    type="text"
                    required
                    disabled={isSubmitting}
                    className="w-full px-6 py-5 bg-black border border-white/10 focus:border-saffron outline-none font-black uppercase tracking-widest text-xl italic transition-all placeholder:text-white/5 disabled:opacity-50"
                    placeholder="E.G. RAJASTHAN RANGERS"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-saffron uppercase tracking-[0.4em] ml-1">The Creed (Description)</label>
                  <textarea 
                    rows={4}
                    required
                    disabled={isSubmitting}
                    className="w-full px-6 py-5 bg-black border border-white/10 focus:border-saffron outline-none font-bold text-sm tracking-wide transition-all placeholder:text-white/5 resize-none leading-relaxed disabled:opacity-50"
                    placeholder="Tell us what your brotherhood stands for. Who do you ride for? What roads do you own?"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-saffron text-white font-black text-xl uppercase tracking-tighter hover:bg-orange-600 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-saffron/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <Zap className="animate-spin" size={20} /> Forging...
                    </span>
                  ) : (
                    <>Forging The Club <ArrowRight className="group-hover:translate-x-2 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
