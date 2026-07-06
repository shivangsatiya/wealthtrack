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
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cyan-500)', letterSpacing: '-1px' }}>
            Wealth<span style={{ color: 'var(--text-primary)' }}>Track</span>
          </div>
          <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Sign in to your financial dashboard
          </p>
        </div>

        <div className="glow-divider" />

        {error && (
          <div className="alert-dark mb-3 p-3 rounded-3" style={{ border: '1px solid var(--red-500)', color: 'var(--red-400)' }}>
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email</label>
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
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--cyan-500)', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
