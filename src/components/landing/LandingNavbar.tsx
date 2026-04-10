import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogIn, Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 py-6",
      isScrolled ? "bg-background/95 backdrop-blur-3xl border-b border-saffron/30 py-4 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)]" : "bg-transparent"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-saffron/20 group-hover:border-saffron transition-colors duration-500">
            <img 
              src="/logo-badge.png" 
              alt="RideSync Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className={cn(
              "text-2xl font-black tracking-[0.1em] uppercase italic transition-colors",
              isScrolled ? "text-foreground" : "text-white"
            )}>
              RIDE<span className="text-saffron">SYNC</span>
            </span>
            <span className="text-[10px] font-bold text-saffron/60 tracking-[0.3em] uppercase ml-0.5">EST. 2023 • MC hub</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {['The Hub', 'The Tribe', 'Routes', 'Support'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className={cn(
                "text-xs font-black uppercase tracking-widest hover:text-saffron transition-all",
                isScrolled ? "text-muted-foreground" : "text-white/70"
              )}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-colors",
              isScrolled ? "hover:bg-muted text-muted-foreground" : "text-white/70 hover:bg-white/10"
            )}
            title={`Switch to ${theme === 'dark' ? 'Daylight' : 'Asphalt'} mode`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-sm bg-gradient-to-r from-zinc-800 to-black text-white border border-white/10 font-black uppercase tracking-widest text-xs hover:border-saffron transition-all shadow-xl"
            >
              <User size={14} className="text-saffron" />
              Dashboard
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className={cn(
                  "hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors",
                  isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
                )}
              >
                Sign In
              </Link>
              <button 
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2 px-8 py-3 rounded-none bg-saffron text-white font-black uppercase tracking-tighter text-sm hover:bg-orange-700 transition-all shadow-2xl shadow-saffron/20 skew-x-[-10deg]"
              >
                <span className="skew-x-[10deg] flex items-center gap-2">
                  <LogIn size={16} />
                  Join the Brotherhood
                </span>
              </button>
            </>
          )}
          <button className={cn(
            "lg:hidden transition-colors",
            isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/50 hover:text-white"
          )}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  )
}
