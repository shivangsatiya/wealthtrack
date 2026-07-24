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

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg-primary)', overflow: 'hidden', position: 'relative' }}>

      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', animation: 'blobFloat 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <style>{`
        @keyframes orbitSpin { from { transform: rotate(0deg) translateX(90px) rotate(0deg); } to { transform: rotate(360deg) translateX(90px) rotate(-360deg); } }
        @keyframes orbitSpin2 { from { transform: rotate(120deg) translateX(90px) rotate(-120deg); } to { transform: rotate(480deg) translateX(90px) rotate(-480deg); } }
        @keyframes orbitSpin3 { from { transform: rotate(240deg) translateX(90px) rotate(-240deg); } to { transform: rotate(600deg) translateX(90px) rotate(-600deg); } }
        @keyframes pulseRing { 0% { transform: translate(-50%,-50%) scale(0.8); opacity:1; } 100% { transform: translate(-50%,-50%) scale(1.6); opacity:0; } }
        @keyframes tileIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .stat-tile:hover { border-color: rgba(6,182,212,0.4) !important; background: rgba(6,182,212,0.08) !important; transform: translateY(-2px); }
        .demo-btn:hover { background: rgba(6,182,212,0.1) !important; }
        .login-input:focus { border-color: var(--color-primary) !important; box-shadow: 0 0 0 3px rgba(6,182,212,0.12) !important; outline: none; }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{
        flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem 3.5rem',
        borderRight: '1px solid var(--color-border)',
        position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }} className="d-none d-lg-flex flex-column">

        {/* Logo */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>
            <span style={{ color: 'var(--color-primary)' }}>Wealth</span>
            <span style={{ color: 'var(--color-text-primary)' }}>Track</span>
          </div>
          <div style={{ width: 40, height: 3, borderRadius: 999, background: 'linear-gradient(90deg, var(--color-primary), transparent)', marginTop: 8 }} />
        </div>

        {/* Headline */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Take control of<br />
            <span style={{ color: 'var(--color-primary)' }}>your finances</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 380, margin: 0 }}>
            Build lasting financial habits, track your wealth growth, and achieve your goals — all in one place.
          </p>
        </div>

        {/* Orbit animation */}
        <div style={{ position: 'relative', width: 200, height: 200, marginBottom: '2.5rem' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '2px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', zIndex: 2 }}>💰</div>
          {[1,2,3].map(i => (
            <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 60, height: 60, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.15)', animation: `pulseRing ${2+i*0.5}s ease-out infinite ${i*0.5}s` }} />
          ))}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 180, height: 180, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '1px dashed rgba(6,182,212,0.15)' }} />
          {[
            { emoji: '📈', anim: 'orbitSpin 8s linear infinite' },
            { emoji: '🎯', anim: 'orbitSpin2 8s linear infinite' },
            { emoji: '⚡', anim: 'orbitSpin3 8s linear infinite' },
          ].map((item, i) => (
            <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 36, height: 36, marginTop: -18, marginLeft: -18, borderRadius: '50%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', animation: item.anim }}>
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 380 }}>
          {[
            { value: '₹8,72,000', label: 'Net worth tracked', icon: 'bi-graph-up-arrow', color: 'var(--color-primary)' },
            { value: '22 days', label: 'Longest habit streak', icon: 'bi-fire', color: 'var(--color-accent)' },
            { value: '4 goals', label: 'Savings goals set', icon: 'bi-bullseye', color: 'var(--color-secondary)' },
            { value: '100%', label: 'Free to use', icon: 'bi-shield-check-fill', color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="stat-tile" style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1rem', transition: 'all 0.3s', cursor: 'default', animation: `tileIn 0.6s ease forwards ${0.3 + i * 0.1}s`, opacity: 0 }}>
              <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1rem' }}></i>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.label}</div>
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
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="d-lg-none text-center mb-4">
            <div style={{ fontSize: '2rem', fontWeight: 900 }}>
              <span style={{ color: 'var(--color-primary)' }}>Wealth</span>
              <span style={{ color: 'var(--color-text-primary)' }}>Track</span>
            </div>
          </div>

          {/* Form card */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: 6, color: 'var(--color-text-primary)' }}>Welcome back 👋</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--color-danger)', background: 'rgba(239,68,68,0.08)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-exclamation-circle-fill"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.9rem', pointerEvents: 'none' }}></i>
                  <input type="email" className="login-input" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.9rem', pointerEvents: 'none' }}></i>
                  <input type={showPassword ? 'text' : 'password'} className="login-input" placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                    style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4, fontSize: '0.9rem' }}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '0.875rem', background: loading ? 'rgba(6,182,212,0.5)' : 'var(--color-primary)',
                border: 'none', borderRadius: 10, color: '#0a0e1a', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(6,182,212,0.25)'
              }}>
                {loading ? <><span className="spinner-border spinner-border-sm"></span> Signing in...</> : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            {/* FIXED: was demo@example.com / password123 — now correct credentials */}
            <div style={{ padding: '1rem', background: 'rgba(6,182,212,0.04)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="bi bi-lightning-charge-fill" style={{ color: 'var(--color-primary)' }}></i>
                <span style={{ fontWeight: 600 }}>Try a demo account</span>
              </div>
              <div
                className="demo-btn"
                onClick={() => setForm({ email: 'priya@example.com', password: 'User@123' })}
                style={{ padding: '0.6rem 0.75rem', background: 'rgba(6,182,212,0.06)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Priya Sharma</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>priya@example.com</div>
                </div>
                <i className="bi bi-arrow-right-circle" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}></i>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Create one free →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }
const labelStyle = { display: 'block', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }
