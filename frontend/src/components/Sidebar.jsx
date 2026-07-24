import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: 'bi-grid-fill', label: 'Dashboard' },
  { to: '/expenses', icon: 'bi-receipt', label: 'Expenses' },
  { to: '/habits', icon: 'bi-lightning-charge-fill', label: 'Habit Tracker' },
  { to: '/goals', icon: 'bi-bullseye', label: 'Savings Goals' },
  { to: '/analytics', icon: 'bi-bar-chart-line-fill', label: 'Wealth Analytics' },
  { to: '/feedback', icon: 'bi-chat-square-text-fill', label: 'Feedback' },
  { to: '/profile', icon: 'bi-person-circle', label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--color-primary)' }}>Wealth</span>
          <span style={{ color: 'var(--color-text-primary)' }}>Track</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '0.75rem 0' }}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ margin: '2px 0.75rem', borderRadius: '0.5rem' }}>
            <i className={`bi ${icon}`} style={{ fontSize: '1.05rem', width: 20 }}></i>
            <span style={{ fontSize: '0.9rem' }}>{label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ margin: '2px 0.75rem', borderRadius: '0.5rem' }}>
            <i className="bi bi-shield-fill" style={{ fontSize: '1.05rem', width: 20 }}></i>
            <span style={{ fontSize: '0.9rem' }}>Admin Panel</span>
          </NavLink>
        )}
      </nav>
      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(6,182,212,0.12)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '0.6rem 1rem', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </aside>
  )
}
