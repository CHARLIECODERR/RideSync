import { useNavigate } from 'react-router-dom'
import { 
  ChevronRight, MapPin, Users, Shield, 
  ArrowRight, Globe, Zap, Calendar, Wrench
} from 'lucide-react'
import LandingNavbar from '@/components/landing/LandingNavbar'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-indigo-royal text-white overflow-hidden selection:bg-saffron/50 font-sans">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-rugged-hero opacity-80 mix-blend-multiply" />
        
        {/* Gritty Asphalt Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]" />

        <div className="container mx-auto px-6 relative z-10 space-y-10 max-w-6xl">
          <div className="flex flex-col items-start gap-6 animate-in fade-in slide-in-from-left-8 duration-1000">
             <div className="inline-flex items-center gap-3 px-6 py-2 rounded-none bg-saffron text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-xl">
              <Globe size={14} /> Asphalt Brotherhood
            </div>
            
            <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase italic select-none">
              SYNC <br />
              <span className="text-saffron">THE RIDE.</span> <br />
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-end justify-between gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <p className="text-xl md:text-2xl text-white/50 font-bold max-w-xl leading-snug border-l-4 border-saffron pl-8">
              The ultimate community hub for the Indian rider. No GPS tracking, just sheer coordination, safety, and the spirit of the long road.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="group relative px-12 py-6 bg-saffron text-white font-black text-xl uppercase tracking-tighter hover:bg-orange-700 transition-all skew-x-[-15deg] shadow-2xl shadow-saffron/30"
              >
                <div className="skew-x-[15deg] flex items-center gap-3">
                  {user ? 'Enter The Hub' : 'Claim Your Patch'}
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 bg-black relative border-y border-white/5">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-20 relative z-10">
          <div className="space-y-6">
            <div className="text-saffron font-black text-6xl italic underline decoration-8 underline-offset-8">01.</div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">No Lone Wolves</h3>
            <p className="text-white/40 font-bold leading-relaxed">We ride together or not at all. Sync with groups that match your bike and your pace.</p>
          </div>
          <div className="space-y-6">
            <div className="text-saffron font-black text-6xl italic underline decoration-8 underline-offset-8">02.</div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Respect the Build</h3>
            <p className="text-white/40 font-bold leading-relaxed">From vintage restaurations to modern beasts, every rider finds their place in the RideSync hierarchy.</p>
          </div>
          <div className="space-y-6">
            <div className="text-saffron font-black text-6xl italic underline decoration-8 underline-offset-8">03.</div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Asphalt Ethics</h3>
            <p className="text-white/40 font-bold leading-relaxed">Safety isn't an option. It's the law of the road. Mechanical support and SOS are built into our DNA.</p>
          </div>
        </div>
      </section>

      {/* The Machine Features */}
      <section id="the hub" className="py-40 relative">
        <div className="container mx-auto px-6 space-y-20">
          <div className="max-w-4xl space-y-6">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">The <span className="text-saffron">Tribe</span> Arsenal.</h2>
            <p className="text-2xl text-white/40 font-bold">Built for the mechanical soul. Tools that don't get in the way of the wind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { icon: <Users size={32} />, title: "Community Sync", desc: "Found a club. Join a crew. Rise through the ranks from Rider to Founder." },
              { icon: <MapPin size={32} />, title: "Route Planning", desc: "No more messy WhatsApp pins. Dedicated waypoints for fuel and fuel for the soul." },
              { icon: <Wrench size={32} />, title: "Mechanical SOS", desc: "Breakdown in the middle of nowhere? Signal the nearby brotherhood for back-up." },
              { icon: <Shield size={32} />, title: "Ride Vetting", desc: "Know who you're riding with. Verified profiles and safety ratings for every member." },
              { icon: <Zap size={32} />, title: "Real-time Pings", desc: "Instant alerts for road hazards, police checkpoints, and hidden gems." },
              { icon: <Calendar size={32} />, title: "Club Events", desc: "Coordinate meetups, anniversary rides, and long-haul expeditions with ease." }
            ].map((f, i) => (
              <div key={i} className="p-12 bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:border-saffron/30 transition-all group relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="text-saffron group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{f.title}</h3>
                  <p className="text-white/40 font-bold text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <div className="text-8xl font-black italic">{i + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: The Call of the Road */}
      <section className="py-40 relative overflow-hidden bg-saffron">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]" />
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center space-y-12">
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter text-black leading-[0.8] uppercase italic">
            THE ASPHALT <br />
            IS CALLING.
          </h2>
          <button 
            onClick={() => navigate('/signup')}
            className="group flex items-center gap-6 px-16 py-8 bg-black text-white font-black text-2xl uppercase tracking-widest hover:scale-105 transition-all skew-x-[-10deg]"
          >
            <span className="skew-x-[10deg] flex items-center gap-4">
              Join the Brotherhood <ArrowRight className="group-hover:translate-x-4 transition-transform duration-500" />
            </span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
               <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 group-hover:border-saffron/50 transition-all duration-700">
                <img src="/logo-badge.png" alt="RideSync" className="h-full w-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
              </div>
              <span className="text-2xl font-black tracking-widest text-white uppercase italic">
                RIDE<span className="text-saffron">SYNC</span>
              </span>
            </div>
            <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em] max-w-xs leading-loose">
              Dedicated to the riders of Bharat. Built on asphalt, fueled by brotherhood. EST 2023.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-saffron">The Hub</h4>
              <ul className="space-y-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                <li><a href="#" className="hover:text-white">Active Rides</a></li>
                <li><a href="#" className="hover:text-white">Find a Club</a></li>
                <li><a href="#" className="hover:text-white">The Garage</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-saffron">Legal</h4>
              <ul className="space-y-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                <li><a href="#" className="hover:text-white">Asphalt Code</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
