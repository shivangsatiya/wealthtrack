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
    } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(`${API}/admin/users/${id}/toggle`)
      setUsers(u => u.map(x => x._id === id ? { ...x, isActive: res.data.user.isActive } : x))
      showToast(res.data.message)
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
  }

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}><div className="spinner-border spinner-cyan" /></div>

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-2">
        <div>
          <h1 className="page-title"><i className="bi bi-shield-fill text-cyan me-2"></i>Admin Panel</h1>
          <p className="page-subtitle">Platform management and analytics</p>
        </div>
      </div>

      {/* Platform stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: 'bi-people-fill', color: 'var(--cyan-500)' },
          { label: 'Active Users', value: stats?.activeUsers, icon: 'bi-person-check-fill', color: 'var(--green-400)' },
          { label: 'New This Month', value: stats?.newUsersThisMonth, icon: 'bi-person-plus-fill', color: 'var(--amber-400)' },
          { label: 'Total Transactions', value: stats?.totalTransactions, icon: 'bi-receipt-cutoff', color: 'var(--purple-500)' },
          { label: 'Active Habits', value: stats?.totalHabits, icon: 'bi-lightning-charge-fill', color: 'var(--cyan-500)' },
          { label: 'Goals Completed', value: stats?.completedGoals, icon: 'bi-trophy-fill', color: 'var(--green-400)' },
        ].map((s, i) => (
          <div className="col-6 col-lg-4 col-xl-2" key={i}>
            <div className="stat-card text-center">
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }}></i>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value ?? '—'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        {['overview','users', 'feedback'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="btn btn-sm"
            style={{
              background: activeTab === tab ? 'var(--cyan-glow)' : 'var(--navy-600)',
              border: `1px solid ${activeTab === tab ? 'var(--cyan-500)' : 'var(--border-color)'}`,
              color: activeTab === tab ? 'var(--cyan-500)' : 'var(--text-secondary)',
              borderRadius: 8, textTransform: 'capitalize', padding: '6px 18px',
              fontWeight: activeTab === tab ? 600 : 400
            }}>
            {tab === 'overview' ? 'Overview' : tab === 'users' ? 'Manage Users' : 'Feedback'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card-dark p-4">
              <h6 className="mb-3" style={{ fontWeight: 600 }}>Recent Registrations</h6>
              {stats?.recentUsers?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No users yet</p>
              ) : stats?.recentUsers?.map(u => (
                <div key={u._id} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--navy-500)', border: '2px solid var(--cyan-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan-500)', flexShrink: 0
                  }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  <span className={`badge rounded-pill ${u.isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card-dark p-4">
              <h6 className="mb-3" style={{ fontWeight: 600 }}>Platform KPIs</h6>
              {[
                { label: 'Goal Completion Rate', value: stats?.totalGoals ? `${Math.round((stats.completedGoals / stats.totalGoals) * 100)}%` : 'N/A', icon: 'bi-bullseye', color: 'var(--amber-400)' },
                { label: 'User Activation Rate', value: stats?.totalUsers ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : 'N/A', icon: 'bi-person-check', color: 'var(--green-400)' },
                { label: 'Avg Habits per User', value: stats?.totalUsers ? (stats.totalHabits / stats.totalUsers).toFixed(1) : 'N/A', icon: 'bi-lightning', color: 'var(--cyan-500)' },
                { label: 'Avg Transactions per User', value: stats?.totalUsers ? (stats.totalTransactions / stats.totalUsers).toFixed(1) : 'N/A', icon: 'bi-receipt', color: 'var(--purple-500)' },
              ].map((kpi, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2">
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
        <div className="card-dark">
          <div className="p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h6 style={{ fontWeight: 600, marginBottom: 0 }}>All Users ({users.length})</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-dark-custom mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'var(--navy-500)', border: '1px solid var(--cyan-500)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-500)', flexShrink: 0
                        }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      <span className={`badge rounded-pill ${u.role === 'admin' ? '' : 'badge-cyan'}`}
                        style={u.role === 'admin' ? { background: 'rgba(139,92,246,0.15)', color: 'var(--purple-500)', border: '1px solid rgba(139,92,246,0.3)', fontSize: '0.7rem' } : { fontSize: '0.7rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${u.isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="btn btn-sm"
                          style={{
                            background: u.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            border: `1px solid ${u.isActive ? 'var(--red-500)' : 'var(--green-500)'}`,
                            color: u.isActive ? 'var(--red-400)' : 'var(--green-400)',
                            fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6
                          }}
                          onClick={() => handleToggle(u._id)}>
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
        <div className="toast-container-custom">
          <div className="p-3 rounded-3" style={{ background: 'var(--navy-500)', border: '1px solid var(--cyan-500)', color: 'var(--text-primary)', minWidth: 220 }}>
            <i className="bi bi-check-circle-fill me-2 text-cyan"></i>{toast}
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

  const STATUS_COLORS = {
    Pending: { bg: 'rgba(245,158,11,0.12)', color: 'var(--amber-400)', border: 'rgba(245,158,11,0.3)' },
    Reviewed: { bg: 'var(--cyan-glow)', color: 'var(--cyan-500)', border: 'rgba(0,198,215,0.3)' },
    Resolved: { bg: 'rgba(16,185,129,0.12)', color: 'var(--green-400)', border: 'rgba(16,185,129,0.3)' },
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border spinner-cyan" /></div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 style={{ fontWeight: 600, marginBottom: 0 }}>All Feedback ({feedbacks.length})</h6>
        <div className="d-flex gap-2">
          {['Pending','Reviewed','Resolved'].map(s => {
            const c = STATUS_COLORS[s]
            return (
              <span key={s} className="badge rounded-pill" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: '0.75rem', padding: '5px 10px' }}>
                {feedbacks.filter(f => f.status === s).length} {s}
              </span>
            )
          })}
        </div>
      </div>
      {feedbacks.length === 0 ? (
        <div className="card-dark text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No feedback submitted yet</p>
        </div>
      ) : feedbacks.map(fb => {
        const s = STATUS_COLORS[fb.status] || STATUS_COLORS.Pending
        return (
          <div key={fb._id} className="card-dark p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fb.subject}</span>
                <span className="ms-2 badge rounded-pill badge-cyan" style={{ fontSize: '0.7rem' }}>{fb.type}</span>
              </div>
              <span className="badge rounded-pill" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '0.7rem' }}>
                {fb.status}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--navy-500)', border: '1px solid var(--cyan-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--cyan-500)', flexShrink: 0 }}>
                {fb.user?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fb.user?.name} · {fb.user?.email}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {new Date(fb.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{fb.message}</p>
            <div className="row g-2">
              <div className="col-md-4">
                <select className="form-select form-select-dark form-select-sm"
                  value={fb.status}
                  onChange={e => handleUpdate(fb._id, e.target.value, fb.adminNote)}>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="col-md-6">
                <input type="text" className="form-control form-control-dark form-control-sm"
                  placeholder="Add a note for the user..."
                  defaultValue={fb.adminNote}
                  onBlur={e => { if (e.target.value !== fb.adminNote) handleUpdate(fb._id, fb.status, e.target.value) }}
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-sm btn-cyan w-100" disabled={updating === fb._id}
                  onClick={() => handleUpdate(fb._id, fb.status, fb.adminNote)}>
                  {updating === fb._id ? <span className="spinner-border spinner-border-sm" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
      {toast && (
        <div className="toast-container-custom">
          <div className="p-3 rounded-3" style={{ background: 'var(--navy-500)', border: '1px solid var(--cyan-500)', color: 'var(--text-primary)', minWidth: 200 }}>
            <i className="bi bi-check-circle-fill me-2 text-cyan"></i>{toast}
          </div>
        </div>
      )}
    </div>
  )
}