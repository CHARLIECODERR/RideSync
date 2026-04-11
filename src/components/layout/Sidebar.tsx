import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Route, Plus, LogOut,
  Bike, Compass, User, ChevronLeft, ChevronRight,
  Sun, Moon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import useAuthStore from '@/features/auth/store/authStore'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/themeStore'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/communities', icon: Users, label: 'Communities' },
    { to: '/rides', icon: Route, label: 'My Rides' },
    { to: '/create-ride', icon: Plus, label: 'New Ride' },
    { to: '/join', icon: Compass, label: 'Join Ride' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <aside className={cn(
      "h-screen bg-card border-r transition-all duration-300 flex flex-col sticky top-0",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between border-b border-white/5 h-24">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="bg-saffron p-2.5 rounded-none shadow-lg shadow-saffron/20 skew-x-[-10deg] flex items-center justify-center min-w-[42px]">
            <div className="skew-x-[10deg]">
              <Bike size={24} className="text-white" />
            </div>
          </div>
          {!collapsed && (
            <span className="font-black text-2xl tracking-[0.2em] uppercase italic text-foreground truncate">
              RIDE<span className="text-saffron">SYNC</span>
            </span>
          )}
        </div>
        <button
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-4 py-3.5 rounded-none transition-all group relative overflow-hidden",
              isActive 
                ? "bg-saffron/10 text-saffron" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-saffron"
                  />
                )}
                <item.icon size={20} className={cn("min-w-[20px]", !collapsed && "group-hover:scale-110 transition-transform duration-500")} />
                {!collapsed && <span className="font-black uppercase tracking-widest text-[11px] italic">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 mt-auto bg-black/20">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-4 w-full px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:bg-white/5 hover:text-saffron transition-all mb-4",
            collapsed && "justify-center"
          )}
          title={theme === 'dark' ? "Light Mode" : "Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={18} className="min-w-[18px]" /> : <Moon size={18} className="min-w-[18px]" />}
          {!collapsed && <span>{theme === 'dark' ? 'Daylight' : 'Asphalt'}</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-4 p-4 bg-muted/20 mb-6 border border-white/5 relative group overflow-hidden">
            <div className="h-10 w-10 bg-saffron/10 border border-saffron/20 flex items-center justify-center font-black text-saffron italic shrink-0 group-hover:bg-saffron group-hover:text-white transition-all duration-500">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black uppercase tracking-tight text-foreground truncate">{user.name}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate">Level 1 Rider</span>
            </div>
          </div>
        )}
        <button
          className={cn(
            "flex items-center gap-4 w-full px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all",
            collapsed && "justify-center"
          )}
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} className="min-w-[18px]" />
          {!collapsed && <span>Retreat</span>}
        </button>
      </div>
    </aside>
  )
}
