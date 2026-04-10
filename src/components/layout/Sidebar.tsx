import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Route, Plus, LogOut,
  Bike, Compass, User, ChevronLeft, ChevronRight,
  Sun, Moon
} from 'lucide-react'
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
      <div className="p-4 flex items-center justify-between border-b h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground min-w-[40px] flex items-center justify-center">
            <Bike size={22} />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent truncate">
              RideSync
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

      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} className={cn("min-w-[20px]", !collapsed && "group-hover:scale-110 transition-transform")} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t mt-auto">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all mb-2",
            collapsed && "justify-center"
          )}
          title={theme === 'dark' ? "Light Mode" : "Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={20} className="min-w-[20px]" /> : <Moon size={20} className="min-w-[20px]" />}
          {!collapsed && <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 mb-3 border border-border/50">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
            collapsed && "justify-center"
          )}
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={20} className="min-w-[20px]" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
