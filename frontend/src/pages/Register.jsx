import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed')
    } finally { setLoading(false) }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="mb-3">
      <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</label>
      <input
        type={type} className="form-control form-control-dark"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        required
      />
    </div>
  )

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--cyan-500)' }}>
            Wealth<span style={{ color: 'var(--text-primary)' }}>Track</span>
          </div>
          <p className="mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Start your financial journey today
          </p>
        </div>

        <div className="glow-divider" />

        {error && (
          <div className="mb-3 p-3 rounded-3" style={{ border: '1px solid var(--red-500)', color: 'var(--red-400)', background: 'rgba(239,68,68,0.08)' }}>
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {field('name', 'Full Name', 'text', 'John Doe')}
          {field('email', 'Email', 'email', 'you@example.com')}
          {field('password', 'Password', 'password', '••••••••')}
          {field('confirm', 'Confirm Password', 'password', '••••••••')}
          <button type="submit" className="btn btn-cyan w-100 py-2 mt-1" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--cyan-500)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
