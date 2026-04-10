import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Plus, MapPin, Globe, Shield, ArrowRight } from 'lucide-react'
import useCommunityStore, { Community } from '@/features/community/store/communityStore'
import { cn } from '@/lib/utils'

export default function CommunitiesPage() {
  const { communities, isLoading } = useCommunityStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = communities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Users size={36} className="text-primary" />
            Communities
          </h1>
          <p className="text-muted-foreground text-lg">Connect with local riders and join active clubs.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          Create Community
        </button>
      </div>

      {/* Search and Filters */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text"
          className="w-full pl-16 pr-6 py-5 rounded-3xl bg-card border border-border focus:border-primary shadow-sm outline-none font-medium transition-all"
          placeholder="Search by name, location, or riding style (e.g. Cruiser, Adventure)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {filtered.map(comm => (
          <div 
            key={comm.id}
            className="group relative flex flex-col bg-card border rounded-[2rem] overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
            onClick={() => navigate(`/communities/${comm.id}`)}
          >
            {/* Header/Image placeholder */}
            <div className="h-32 bg-gradient-to-br from-primary/20 to-blue-500/10 relative">
              <div className="absolute top-4 right-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm",
                  comm.role === 'Admin' ? "bg-primary text-primary-foreground" : "bg-white text-slate-900"
                )}>
                  {comm.role === 'Admin' && <Shield size={10} />}
                  {comm.role}
                </span>
              </div>
              <div className="absolute -bottom-6 left-6">
                <div className="h-16 w-16 rounded-2xl bg-white shadow-xl shadow-primary/10 border-4 border-card flex items-center justify-center text-2xl font-black text-primary group-hover:scale-110 transition-transform">
                  {comm.name.charAt(0)}
                </div>
              </div>
            </div>

            <div className="p-8 pt-10 flex-1 flex flex-col space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{comm.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                  {comm.description || "A passionate group of riders exploring routes and sharing adventures."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {comm.tags?.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t mt-auto flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <div className="flex items-center gap-1"><Users size={14} className="text-primary" /> {comm.members}</div>
                  <div className="flex items-center gap-1"><Plus size={14} className="text-primary" /> {comm.rides} Rides</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center space-y-6 bg-muted/20 border-2 border-dashed rounded-[3rem]">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Globe size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black">No communities found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Try searching for something else or start your own riding club!</p>
          </div>
          <button className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20">
            Start a New Community
          </button>
        </div>
      )}
    </div>
  )
}
