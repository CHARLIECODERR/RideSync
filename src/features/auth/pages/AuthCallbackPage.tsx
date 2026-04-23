import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { isLocalMode } from '@/lib/api'
import useAuthStore from '../store/authStore'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { initAuth } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');

      if (isLocalMode() && token) {
        try {
          localStorage.setItem('ridesync_token', token);
          await initAuth();
          navigate('/dashboard');
          return;
        } catch (err: any) {
          setError('Failed to establish local session');
          return;
        }
      }

      // Fallback to Supabase logic
      try {
        const { data: { session }, error: supabaseError } = await supabase.auth.getSession()
        if (supabaseError) throw supabaseError;
        
        if (session) {
          navigate('/dashboard?verified=true');
        } else {
          setError('Verification link may have expired or is invalid.');
        }
      } catch (err: any) {
        console.error('Callback Error:', err);
        setError(err.message);
      }
    }

    handleAuthCallback()
  }, [navigate, initAuth])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20 bg-rugged-hero bg-cover bg-center grayscale" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      
      <div className="relative z-10 w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-1000">
        {!error ? (
          <>
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 border-4 border-saffron/10 border-t-saffron rounded-full animate-spin" />
              <div className="absolute inset-4 bg-saffron/5 border border-saffron/20 flex items-center justify-center shadow-[0_0_30px_rgba(183,65,14,0.3)]">
                <ShieldCheck size={32} className="text-saffron animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Verifying Intel.</h2>
              <p className="text-saffron/60 text-xs font-black uppercase tracking-[0.4em] animate-pulse">Establishing Mission Credentials...</p>
            </div>

            <div className="pt-8 flex justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-1 w-8 bg-saffron/20 rounded-full overflow-hidden"
                >
                  <div 
                    className="h-full bg-saffron transition-all duration-1000"
                    style={{ 
                      width: '100%', 
                      animation: `loading-bar 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`
                    }} 
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-10">
            <div className="mx-auto h-20 w-20 bg-red-900/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Signal Lost.</h2>
              <p className="text-white/40 font-bold max-w-xs mx-auto text-sm leading-relaxed">
                {error}
              </p>
            </div>

            <button 
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Return to Base
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
