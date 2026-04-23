import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bike, Mail, Lock, User, ArrowRight, ShieldCheck, Zap, Users, CheckCircle, Send, Sun, Moon } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  
  const { login, signup, loginWithGoogle, isLoading, error, clearError } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justVerified = searchParams.get('verified') === 'true'

  useEffect(() => {
    if (justVerified) {
      setIsLogin(true)
    }
  }, [justVerified])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (isLogin) {
      const success = await login(email, password)
      if (success) navigate('/dashboard')
    } else {
      const success = await signup(name, email, password)
      if (success) navigate('/dashboard')
    }
  }

  const toggleAuth = () => {
    setIsLogin(!isLogin)
    clearError()
  }

  if (isVerificationSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="absolute inset-0 opacity-20 bg-rugged-hero bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        
        <div className="relative z-10 w-full max-w-lg bg-background border border-border p-12 space-y-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-20 w-20 bg-saffron/10 border border-saffron/30 flex items-center justify-center shadow-[0_0_40px_rgba(183,65,14,0.2)]">
              <Send size={40} className="text-saffron animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">Signal Dispatched.</h2>
              <p className="text-muted-foreground font-bold max-w-xs mx-auto text-sm leading-relaxed">
                We've sent an encrypted verification link to <span className="text-saffron">{email}</span>. Confirm your intel to join the pack.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col gap-4">
            <button 
              onClick={() => setIsVerificationSent(false)}
              className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all underline underline-offset-8"
            >
              Return to Base
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative">
      {/* Absolute Theme Toggle Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-muted/80 backdrop-blur-md text-foreground border border-border/50 hover:bg-muted transition-all shadow-xl"
        title={`Switch to ${theme === 'dark' ? 'Daylight' : 'Asphalt'} mode`}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-background relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-40 bg-rugged-hero bg-cover bg-center mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-saffron/20" />
        
          <div className="relative z-10 space-y-8 max-w-lg">
          <div className="flex items-center gap-4 group">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-saffron/30 shadow-2xl group-hover:border-saffron transition-all duration-700">
              <img src="/logo-badge.png" alt="RideSync Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-4xl font-black text-foreground tracking-[0.1em] uppercase italic">
                RIDE<span className="text-saffron">SYNC</span>
              </span>
              <span className="text-xs font-bold text-saffron/60 tracking-[0.4em] uppercase ml-1">EST. 2023 • MC hub</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-black text-foreground leading-tight tracking-tight">
            The ultimate coordination hub for motorcyclists.
          </h1>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0 border border-border">
                <Zap size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-bold text-lg">Real-time Coordination</h3>
                <p className="text-muted-foreground text-sm font-medium">Synced locations and real-time alerts across your entire group.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0 border border-border">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-bold text-lg">Community Driven</h3>
                <p className="text-muted-foreground text-sm font-medium">Join thousands of riders in specialized clubs and regional groups.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 flex -space-x-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="user" />
              </div>
            ))}
            <div className="h-10 px-4 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary tracking-widest uppercase shadow-lg translate-x-6">
              Join the pack
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3">
            {justVerified && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Intel Verified</p>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none mt-1">Your credentials are established. Sign in to start the mission.</p>
                </div>
              </div>
            )}
            <h2 className="text-4xl font-black tracking-tight">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground font-medium text-lg">
              {isLogin 
                ? 'Sign in to access your ride dashboard.' 
                : 'Join the community and start planning rides.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                    placeholder="Alex Rider"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs font-black text-primary hover:underline">Forgot password?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-in fade-in slide-in-from-top-2">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Join the Community'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => loginWithGoogle()}
            className="w-full py-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-center gap-3 font-bold hover:bg-muted/50 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </button>


          <div className="text-center pt-4">
            <p className="text-muted-foreground font-medium">
              {isLogin ? "New to RideSync?" : "Already have an account?"}{' '}
              <button 
                onClick={toggleAuth}
                className="text-primary font-black hover:underline"
              >
                {isLogin ? 'Create one here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
