import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--navy-900)' }}>

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem', background: 'linear-gradient(135deg, rgba(0,198,215,0.08) 0%, rgba(13,18,38,0.98) 100%)',
        borderRight: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden'
      }} className="d-none d-lg-flex">

        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,198,215,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--cyan-500)', marginBottom: 8, letterSpacing: '-1px' }}>
            Wealth<span style={{ color: 'var(--text-primary)' }}>Track</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: 400 }}>
            Build financial habits. Track your wealth. Reach your goals.
          </p>

          {/* Stats */}
          <div className="row g-3 mb-4" style={{ maxWidth: 420 }}>
            {[
              { value: '8+', label: 'Powerful Pages', icon: 'bi-grid-fill' },
              { value: '5', label: 'Habit Categories', icon: 'bi-lightning-charge-fill' },
              { value: '100%', label: 'Free to Use', icon: 'bi-shield-check-fill' },
              { value: '∞', label: 'Goals You Can Set', icon: 'bi-bullseye' },
            ].map((s, i) => (
              <div className="col-6" key={i}>
                <div style={{
                  background: 'rgba(0,198,215,0.06)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12, padding: '1rem',
                  transition: 'all 0.3s'
                }}>
                  <i className={`bi ${s.icon} text-cyan`} style={{ fontSize: '1.2rem' }}></i>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cyan-500)', marginTop: 6 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Features list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: 'bi-graph-up-arrow', text: 'Track income, expenses and net worth' },
              { icon: 'bi-fire', text: 'Build habits with daily streaks' },
              { icon: 'bi-piggy-bank-fill', text: 'Set and achieve savings goals' },
              { icon: 'bi-bar-chart-line-fill', text: 'Visualize your financial growth' },
            ].map((f, i) => (
              <div key={i} className="d-flex align-items-center gap-3">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(0,198,215,0.1)',
                  border: '1px solid rgba(0,198,215,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className={`bi ${f.icon} text-cyan`}></i>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="d-lg-none text-center mb-4">
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cyan-500)' }}>
              Wealth<span style={{ color: 'var(--text-primary)' }}>Track</span>
            </div>
          </div>

          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-3 p-3 rounded-3" style={{ border: '1px solid var(--red-500)', color: 'var(--red-400)', background: 'rgba(239,68,68,0.08)', fontSize: '0.875rem' }}>
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email address</label>
              <input
                type="email"
                className="form-control form-control-dark"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
              <input
                type="password"
                className="form-control form-control-dark"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-cyan w-100 py-2" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
                : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
              }
            </button>
          </form>

          <div className="glow-divider mt-4" />

          <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--cyan-500)', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
          </p>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1.5rem', padding: '1rem',
            background: 'rgba(0,198,215,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: 10, fontSize: '0.8rem'
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              <i className="bi bi-info-circle me-1 text-cyan"></i>Demo credentials
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Admin: <span style={{ color: 'var(--cyan-500)' }}>admin@wealthtrack.com</span></div>
            <div style={{ color: 'var(--text-secondary)' }}>User: <span style={{ color: 'var(--cyan-500)' }}>priya@example.com</span></div>
            <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>Password: <span style={{ color: 'var(--text-secondary)' }}>Admin@123 / User@123</span></div>
          </div>

        </div>
      </div>
    </div>
  )
}