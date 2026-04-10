import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike, Mail, Lock, User, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react'
import useAuth from '../hooks/useAuth'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const { login, signup, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (isLogin) {
      const success = await login(email, password)
      if (success) navigate('/dashboard')
    } else {
      const success = await signup(name, email, password)
      if (success) {
        // Subapase might require email confirmation.
        // For simplicity, we navigate to dashboard, but real apps might show "Check Email"
        navigate('/dashboard')
      }
    }
  }

  const toggleAuth = () => {
    setIsLogin(!isLogin)
    clearError()
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full translate-x-1/3 translate-y-1/3 blur-[120px]" />
        </div>
        
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl">
              <Bike size={32} />
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">RideSync</span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            The ultimate coordiantion hub for motorcyclists.
          </h1>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Zap size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Real-time Coordination</h3>
                <p className="text-white/60 text-sm font-medium">Synced locations and real-time alerts across your entire group.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Community Driven</h3>
                <p className="text-white/60 text-sm font-medium">Join thousands of riders in specialized clubs and regional groups.</p>
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
