import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: 'bi-grid-fill', label: 'Dashboard' },
  { to: '/expenses', icon: 'bi-receipt', label: 'Expenses' },
  { to: '/habits', icon: 'bi-lightning-charge-fill', label: 'Habit Tracker' },
  { to: '/goals', icon: 'bi-bullseye', label: 'Savings Goals' },
  { to: '/analytics', icon: 'bi-bar-chart-line-fill', label: 'Wealth Analytics' },
  { to: '/profile', icon: 'bi-person-circle', label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Wealth<span>Track</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item-custom ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${icon}`}></i>
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-item-custom ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-shield-fill"></i>
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--navy-500)', border: '2px solid var(--cyan-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan-500)',
            flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-sm w-100" style={{
          background: 'var(--navy-500)', border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)', borderRadius: 8
        }}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </aside>
  )
}
