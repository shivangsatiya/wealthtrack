import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [s, u] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`)
      ])
      setStats(s.data); setUsers(u.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(`${API}/admin/users/${id}/toggle`)
      setUsers(u => u.map(x => x._id === id ? { ...x, isActive: res.data.user.isActive } : x))
      showToast(res.data.message)
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
  }

  // FIXED: replaced spinner-cyan with Bootstrap spinner
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner-border" style={{ color: 'var(--color-primary)' }} />
    </div>
  )

  return (
    <div>
      {/* FIXED: replaced page-title/page-subtitle classes with inline styles */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          <i className="bi bi-shield-fill me-2" style={{ color: 'var(--color-primary)' }}></i>Admin Panel
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Platform management and analytics</p>
      </div>

      {/* FIXED: replaced --cyan-500 with --color-primary, removed stat-card class */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: 'bi-people-fill', color: 'var(--color-primary)' },
          { label: 'Active Users', value: stats?.activeUsers, icon: 'bi-person-check-fill', color: 'var(--color-secondary)' },
          { label: 'New This Month', value: stats?.newUsersThisMonth, icon: 'bi-person-plus-fill', color: 'var(--color-accent)' },
          { label: 'Total Transactions', value: stats?.totalTransactions, icon: 'bi-receipt-cutoff', color: 'var(--color-purple)' },
          { label: 'Active Habits', value: stats?.totalHabits, icon: 'bi-lightning-charge-fill', color: 'var(--color-primary)' },
          { label: 'Goals Completed', value: stats?.completedGoals, icon: 'bi-trophy-fill', color: 'var(--color-secondary)' },
        ].map((s, i) => (
          <div className="col-6 col-lg-4 col-xl-2" key={i}>
            <div className="hover-card" style={{ ...cardStyle, textAlign: 'center' }}>
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }}></i>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value ?? '—'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FIXED: replaced --cyan-500/--navy-600/--border-color/--text-secondary with new vars */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {['overview','users','feedback'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '6px 18px', borderRadius: 8,
            fontWeight: activeTab === tab ? 600 : 400,
            background: activeTab === tab ? 'rgba(6,182,212,0.12)' : 'var(--color-bg-secondary)',
            border: `1px solid ${activeTab === tab ? 'var(--color-primary)' : 'var(--color-border)'}`,
            color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s'
          }}>
            {tab === 'overview' ? 'Overview' : tab === 'users' ? 'Manage Users' : 'Feedback'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="row g-3">
          {/* FIXED: replaced card-dark with inline cardStyle, fixed --text-muted/--border-color/--navy-500/--cyan-500 */}
          <div className="col-lg-6">
            <div className="hover-card" style={cardStyle}>
              <h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Recent Registrations</h6>
              {stats?.recentUsers?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No users yet</p>
              ) : stats?.recentUsers?.map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  {/* FIXED: replaced badge-green/badge-red with inline styles */}
                  <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: 999, background: u.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: u.isActive ? 'var(--color-secondary)' : 'var(--color-danger)', border: `1px solid ${u.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hover-card" style={cardStyle}>
              <h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Platform KPIs</h6>
              {[
                { label: 'Goal Completion Rate', value: stats?.totalGoals ? `${Math.round((stats.completedGoals / stats.totalGoals) * 100)}%` : 'N/A', icon: 'bi-bullseye', color: 'var(--color-accent)' },
                { label: 'User Activation Rate', value: stats?.totalUsers ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : 'N/A', icon: 'bi-person-check', color: 'var(--color-secondary)' },
                { label: 'Avg Habits per User', value: stats?.totalUsers ? (stats.totalHabits / stats.totalUsers).toFixed(1) : 'N/A', icon: 'bi-lightning', color: 'var(--color-primary)' },
                { label: 'Avg Transactions per User', value: stats?.totalUsers ? (stats.totalTransactions / stats.totalUsers).toFixed(1) : 'N/A', icon: 'bi-receipt', color: 'var(--color-purple)' },
              ].map((kpi, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`bi ${kpi.icon}`} style={{ color: kpi.color, fontSize: '1rem' }}></i>
                    <span style={{ fontSize: '0.875rem' }}>{kpi.label}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: kpi.color }}>{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div style={cardStyle}>
          <div style={{ padding: '0 0 0.75rem 0', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
            <h6 style={{ fontWeight: 600, margin: 0 }}>All Users ({users.length})</h6>
          </div>
          {/* FIXED: replaced table-dark-custom class with inline table styles */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)' }}>
                  {['User','Email','Role','Joined','Last Login','Status','Action'].map(h => (
                    <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* FIXED: replaced var(--navy-500)/var(--cyan-500) */}
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td style={tdStyle}>
                      {/* FIXED: replaced badge-cyan with inline style */}
                      <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 999, background: u.role === 'admin' ? 'rgba(139,92,246,0.12)' : 'rgba(6,182,212,0.1)', color: u.role === 'admin' ? 'var(--color-purple)' : 'var(--color-primary)', border: `1px solid ${u.role === 'admin' ? 'rgba(139,92,246,0.3)' : 'rgba(6,182,212,0.2)'}` }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td style={tdStyle}>
                      {/* FIXED: replaced badge-green/badge-red with inline styles */}
                      <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 999, background: u.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: u.isActive ? 'var(--color-secondary)' : 'var(--color-danger)', border: `1px solid ${u.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleToggle(u._id)} style={{
                          fontSize: '0.75rem', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s',
                          background: u.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          border: `1px solid ${u.isActive ? 'var(--color-danger)' : 'var(--color-secondary)'}`,
                          color: u.isActive ? 'var(--color-danger)' : 'var(--color-secondary)'
                        }}>
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <FeedbackTab />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-check-circle-fill" style={{ color: 'var(--color-primary)' }}></i>{toast}
          </div>
        </div>
      )}
    </div>
  )
}

function FeedbackTab() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [updating, setUpdating] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    axios.get(`${API}/feedback`)
      .then(res => setFeedbacks(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdate = async (id, status, adminNote) => {
    setUpdating(id)
    try {
      const res = await axios.patch(`${API}/feedback/${id}`, { status, adminNote })
      setFeedbacks(f => f.map(x => x._id === id ? res.data : x))
      showToast('Updated!')
    } catch (err) { showToast('Error updating') }
    finally { setUpdating(null) }
  }

  const STATUS_STYLES = {
    Pending:  { bg: 'rgba(245,158,11,0.12)',  color: 'var(--color-accent)',    border: 'rgba(245,158,11,0.3)' },
    Reviewed: { bg: 'rgba(6,182,212,0.12)',   color: 'var(--color-primary)',  border: 'rgba(6,182,212,0.3)' },
    Resolved: { bg: 'rgba(16,185,129,0.12)',  color: 'var(--color-secondary)', border: 'rgba(16,185,129,0.3)' },
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div className="spinner-border" style={{ color: 'var(--color-primary)' }} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h6 style={{ fontWeight: 600, margin: 0 }}>All Feedback ({feedbacks.length})</h6>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Pending','Reviewed','Resolved'].map(s => {
            const c = STATUS_STYLES[s]
            return (
              <span key={s} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 999, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {feedbacks.filter(f => f.status === s).length} {s}
              </span>
            )
          })}
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)' }}></i>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No feedback submitted yet</p>
        </div>
      ) : feedbacks.map(fb => {
        const s = STATUS_STYLES[fb.status] || STATUS_STYLES.Pending
        return (
          <div key={fb._id} style={{ ...cardStyle, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fb.subject}</span>
                <span style={{ marginLeft: 8, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(6,182,212,0.2)' }}>{fb.type}</span>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {fb.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                {fb.user?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{fb.user?.name} · {fb.user?.email}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                {new Date(fb.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>{fb.message}</p>
            <div className="row g-2">
              <div className="col-md-4">
                <select style={inputStyle}
                  value={fb.status}
                  onChange={e => handleUpdate(fb._id, e.target.value, fb.adminNote)}>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="col-md-6">
                <input type="text" style={inputStyle}
                  placeholder="Add a note for the user..."
                  defaultValue={fb.adminNote}
                  onBlur={e => { if (e.target.value !== fb.adminNote) handleUpdate(fb._id, fb.status, e.target.value) }}
                />
              </div>
              <div className="col-md-2">
                <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}
                  disabled={updating === fb._id}
                  onClick={() => handleUpdate(fb._id, fb.status, fb.adminNote)}>
                  {updating === fb._id ? <span className="spinner-border spinner-border-sm" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-check-circle-fill" style={{ color: 'var(--color-primary)' }}></i>{toast}
          </div>
        </div>
      )}
    </div>
  )
}

const cardStyle = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '1.25rem' }
const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none' }
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.875rem', verticalAlign: 'middle' }
const btnPrimary = { background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: '#0a0e1a', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }
