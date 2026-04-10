import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike, Mail, Lock, User, ArrowRight, Zap, Shield, MapPin } from 'lucide-react'
import useAuthStore from '../store/authStore'
import './Auth.css'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('rider@ridesync.app')
  const [password, setPassword] = useState('demo123')
  const { login, signup, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    let success

    if (isLogin) {
      success = await login(email, password)
    } else {
      success = await signup(name, email, password)
    }

    if (success) {
      navigate('/')
    }
  }

  const toggleMode = () => {
    clearError()
    setIsLogin(!isLogin)
  }

  const features = [
    { icon: MapPin, title: 'Route Planning', desc: 'Plan rides with waypoints and stops' },
    { icon: Zap, title: 'Real-time Tracking', desc: 'Track riders live on the map' },
    { icon: Shield, title: 'Emergency Alerts', desc: 'Keep everyone safe with instant comms' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand animate-fade-in">
            <div className="auth-brand-icon">
              <Bike size={32} />
            </div>
            <h1 className="gradient-text">RideSync</h1>
          </div>

          <h2 className="auth-tagline animate-fade-in-up">
            Ride Together.<br />Stay Connected.
          </h2>

          <p className="auth-subtitle animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            The ultimate platform for coordinating group rides. Plan routes,
            track your crew in real-time, and make every ride safer.
          </p>

          <div className="auth-features stagger-children">
            {features.map((feat, i) => (
              <div key={i} className="auth-feature glass">
                <div className="auth-feature-icon">
                  <feat.icon size={20} />
                </div>
                <div>
                  <h4>{feat.title}</h4>
                  <p>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated background orbs */}
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-right">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header">
            <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p>
              {isLogin
                ? 'Sign in to continue your ride'
                : 'Join the community and start riding'}
            </p>
          </div>

          {error && (
            <div className="auth-error animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    id="name"
                    type="text"
                    className="input auth-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="input auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="password"
                  type="password"
                  className="input auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button className="auth-switch" onClick={toggleMode}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className="auth-demo-hint">
            <p>🎮 Demo mode — just click <strong>Sign In</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
