import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--navy-900)',
      overflow: 'hidden', position: 'relative'
    }}>

      {/* Animated background blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,198,215,0.07) 0%, transparent 70%)',
          animation: 'blobFloat 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          animation: 'blobFloat 10s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '40%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,198,215,0.04) 0%, transparent 70%)',
          animation: 'blobFloat 12s ease-in-out infinite 2s',
        }} />
        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,198,215,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,198,215,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
        }
        @keyframes orbitSpin2 {
          from { transform: rotate(120deg) translateX(90px) rotate(-120deg); }
          to { transform: rotate(480deg) translateX(90px) rotate(-480deg); }
        }
        @keyframes orbitSpin3 {
          from { transform: rotate(240deg) translateX(90px) rotate(-240deg); }
          to { transform: rotate(600deg) translateX(90px) rotate(-600deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .stat-tile:hover {
          border-color: rgba(0,198,215,0.4) !important;
          background: rgba(0,198,215,0.1) !important;
          transform: translateY(-2px);
        }
        .feature-row:hover .feature-icon {
          background: rgba(0,198,215,0.2) !important;
          border-color: rgba(0,198,215,0.4) !important;
        }
        .login-input:focus {
          border-color: var(--cyan-500) !important;
          box-shadow: 0 0 0 3px rgba(0,198,215,0.12) !important;
        }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{
        flex: 1.2,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem 3.5rem',
        borderRight: '1px solid rgba(0,198,215,0.08)',
        position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }} className="d-none d-lg-flex flex-column">

        {/* Logo */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1,
            background: 'linear-gradient(135deg, #00c6d7, #67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block'
          }}>
            Wealth
          </div>
          <span style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-2px', color: 'var(--text-primary)' }}>Track</span>
          <div style={{
            width: 40, height: 3, borderRadius: 999,
            background: 'linear-gradient(90deg, var(--cyan-500), transparent)',
            marginTop: 8
          }} />
        </div>

        {/* Headline */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2,
            color: 'var(--text-primary)', marginBottom: 16
          }}>
            Take control of<br />
            <span style={{
              background: 'linear-gradient(135deg, #00c6d7, #67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              your finances
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 380 }}>
            Build lasting financial habits, track your wealth growth, and achieve your goals — all in one place.
          </p>
        </div>

        {/* Orbit animation */}
        <div style={{ position: 'relative', width: 200, height: 200, marginBottom: '2.5rem' }}>
          {/* Center */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0,198,215,0.2), rgba(0,198,215,0.05))',
            border: '2px solid rgba(0,198,215,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', zIndex: 2
          }}>
            💰
          </div>
          {/* Pulse rings */}
          {[1, 1.5, 2].map((scale, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 60, height: 60,
              transform: `translate(-50%, -50%)`,
              borderRadius: '50%',
              border: '1px solid rgba(0,198,215,0.15)',
              animation: `pulse-ring 3s ease-out infinite ${i * 1}s`,
            }} />
          ))}
          {/* Orbit ring */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 180, height: 180,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px dashed rgba(0,198,215,0.15)',
          }} />
          {/* Orbiting icons */}
          {[
            { emoji: '📈', animation: 'orbitSpin 8s linear infinite' },
            { emoji: '🎯', animation: 'orbitSpin2 8s linear infinite' },
            { emoji: '⚡', animation: 'orbitSpin3 8s linear infinite' },
          ].map((item, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 36, height: 36, marginTop: -18, marginLeft: -18,
              borderRadius: '50%',
              background: 'var(--navy-600)',
              border: '1px solid rgba(0,198,215,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
              animation: item.animation,
            }}>
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 380 }}>
          {[
            { value: '₹8,72,000', label: 'Net worth tracked', icon: 'bi-graph-up-arrow', color: '#00c6d7' },
            { value: '22 days', label: 'Longest habit streak', icon: 'bi-fire', color: '#f59e0b' },
            { value: '4 goals', label: 'Savings goals set', icon: 'bi-bullseye', color: '#10b981' },
            { value: '100%', label: 'Free to use', icon: 'bi-shield-check-fill', color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="stat-tile" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(0,198,215,0.1)',
              borderRadius: 12, padding: '1rem',
              transition: 'all 0.3s',
              cursor: 'default',
              animation: `fadeInUp 0.6s ease forwards ${0.3 + i * 0.1}s`,
              opacity: 0,
            }}>
              <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1rem' }}></i>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: '100%', maxWidth: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(40px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="d-lg-none text-center mb-4">
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #00c6d7, #67e8f9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Wealth</span>
              <span style={{ color: 'var(--text-primary)' }}>Track</span>
            </div>
          </div>

          {/* Form card */}
          <div style={{
            background: 'rgba(13,18,38,0.8)',
            border: '1px solid rgba(0,198,215,0.12)',
            borderRadius: 20,
            padding: '2.5rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: 6, color: 'var(--text-primary)' }}>
                Welcome back 👋
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Sign in to continue to your dashboard
              </p>
            </div>

            {error && (
              <div style={{
                marginBottom: '1.25rem', padding: '0.875rem 1rem',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, color: 'var(--red-400)',
                background: 'rgba(239,68,68,0.08)',
                fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <i className="bi bi-exclamation-circle-fill"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6, display: 'block' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-envelope" style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontSize: '0.9rem', pointerEvents: 'none'
                  }}></i>
                  <input
                    type="email"
                    className="login-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(0,198,215,0.15)',
                      borderRadius: 10, color: 'var(--text-primary)',
                      fontSize: '0.9rem', outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6, display: 'block' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-lock" style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontSize: '0.9rem', pointerEvents: 'none'
                  }}></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    style={{
                      width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(0,198,215,0.15)',
                      borderRadius: 10, color: 'var(--text-primary)',
                      fontSize: '0.9rem', outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 4, fontSize: '0.9rem'
                  }}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Sign in button */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '0.875rem',
                background: loading ? 'rgba(0,198,215,0.5)' : 'linear-gradient(135deg, #00c6d7, #0891b2)',
                border: 'none', borderRadius: 10,
                color: '#0a0e1a', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(0,198,215,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
                onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 6px 28px rgba(0,198,215,0.5)' }}
                onMouseLeave={e => { if (!loading) e.target.style.boxShadow = '0 4px 20px rgba(0,198,215,0.3)' }}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm"></span> Signing in...</>
                  : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,198,215,0.1)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,198,215,0.1)' }} />
            </div>

            {/* Demo credentials */}
            <div style={{
              padding: '1rem',
              background: 'rgba(0,198,215,0.04)',
              border: '1px solid rgba(0,198,215,0.1)',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="bi bi-lightning-charge-fill" style={{ color: 'var(--cyan-500)' }}></i>
                <span style={{ fontWeight: 600 }}>Try a demo account</span>
              </div>
              <div
                onClick={() => setForm({ email: 'priya@example.com', password: 'User@123' })}
                style={{
                  padding: '0.6rem 0.75rem',
                  background: 'rgba(0,198,215,0.06)',
                  border: '1px solid rgba(0,198,215,0.12)',
                  borderRadius: 8, cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,198,215,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,198,215,0.06)'}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Priya Sharma</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>priya@example.com</div>
                </div>
                <i className="bi bi-arrow-right-circle" style={{ color: 'var(--cyan-500)', fontSize: '1.1rem' }}></i>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--cyan-500)', textDecoration: 'none', fontWeight: 600 }}>
                Create one free →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
