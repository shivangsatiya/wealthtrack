import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Close sidebar whenever route changes
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: 300,
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontSize: '1.2rem',
        }}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'}`}></i>
      </button>

      {/* Dark overlay — tap to close */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 149,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          transform: open ? 'translateX(0)' : undefined,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--color-primary)' }}>Wealth</span>
            <span style={{ color: 'var(--color-text-primary)' }}>Track</span>
          </div>
          {/* Close button inside sidebar on mobile */}
          <button
            onClick={() => setOpen(false)}
            className="mobile-close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: 4,
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ margin: '2px 0.75rem', borderRadius: '0.5rem' }}
            >
              <i className={`bi ${icon}`} style={{ fontSize: '1.05rem', width: 20 }}></i>
              <span style={{ fontSize: '0.9rem' }}>{label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ margin: '2px 0.75rem', borderRadius: '0.5rem' }}
            >
              <i className="bi bi-shield-fill" style={{ fontSize: '1.05rem', width: 20 }}></i>
              <span style={{ fontSize: '0.9rem' }}>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(6,182,212,0.12)',
              border: '2px solid var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '0.6rem 1rem',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
            color: 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s'
          }}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
