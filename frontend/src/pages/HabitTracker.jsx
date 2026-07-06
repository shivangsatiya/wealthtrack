import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'

const CATEGORIES = ['Saving','Budgeting','Investing','Tracking','Learning']
const CATEGORY_COLORS = {
  Saving: 'var(--green-400)', Budgeting: 'var(--cyan-500)',
  Investing: 'var(--amber-400)', Tracking: 'var(--purple-500)', Learning: 'var(--red-400)'
}
const FREQ = ['daily','weekly','monthly']

export default function HabitTracker() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', category: 'Saving', targetAmount: '' })
  const [saving, setSaving] = useState(false)

  const fetchHabits = async () => {
    setLoading(true)
    try { const res = await axios.get(`${API}/habits`); setHabits(res.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchHabits() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const isCompletedToday = (habit) => {
    const today = new Date(); today.setHours(0,0,0,0)
    return habit.completions?.some(c => {
      const d = new Date(c.date); d.setHours(0,0,0,0)
      return d.getTime() === today.getTime()
    })
  }

  const handleComplete = async (id) => {
    setCompleting(id)
    try {
      const res = await axios.post(`${API}/habits/${id}/complete`)
      setHabits(h => h.map(x => x._id === id ? res.data : x))
      showToast('Habit completed! 🔥')
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setCompleting(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return
    await axios.delete(`${API}/habits/${id}`)
    setHabits(h => h.filter(x => x._id !== id))
    showToast('Habit removed')
  }

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await axios.post(`${API}/habits`, { ...form, targetAmount: form.targetAmount || 0 })
      setHabits(h => [res.data, ...h])
      setShowModal(false)
      setForm({ name: '', description: '', frequency: 'daily', category: 'Saving', targetAmount: '' })
      showToast('Habit created!')
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const completedToday = habits.filter(isCompletedToday).length
  const totalStreak = habits.reduce((s, h) => s + h.streak, 0)

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Habit Tracker</h1>
          <p className="page-subtitle">Build consistent financial habits</p>
        </div>
        <button className="btn btn-cyan" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>New Habit
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "Today's Progress", value: `${completedToday}/${habits.length}`, sub: 'habits done', icon: 'bi-check-circle-fill', color: 'var(--green-400)' },
          { label: 'Total Streak Points', value: totalStreak, sub: 'across all habits', icon: 'bi-fire', color: 'var(--amber-400)' },
          { label: 'Active Habits', value: habits.length, sub: 'being tracked', icon: 'bi-lightning-charge-fill', color: 'var(--cyan-500)' },
        ].map((s, i) => (
          <div className="col-4" key={i}>
            <div className="stat-card text-center">
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }}></i>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border spinner-cyan" /></div>
      ) : habits.length === 0 ? (
        <div className="card-dark text-center py-5">
          <i className="bi bi-lightning-charge" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
          <p className="mt-3" style={{ color: 'var(--text-muted)' }}>No habits yet. Start building your first financial habit!</p>
          <button className="btn btn-cyan mt-2" onClick={() => setShowModal(true)}>Create Habit</button>
        </div>
      ) : (
        <div className="row g-3">
          {habits.map(habit => {
            const done = isCompletedToday(habit)
            const color = CATEGORY_COLORS[habit.category] || 'var(--cyan-500)'
            return (
              <div className="col-md-6 col-lg-4" key={habit._id}>
                <div className={`habit-card ${done ? 'completed-today' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge rounded-pill me-2" style={{ background: `${color}20`, color, border: `1px solid ${color}40`, fontSize: '0.7rem' }}>
                        {habit.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{habit.frequency}</span>
                    </div>
                    <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: 0 }}
                      onClick={() => handleDelete(habit._id)}>
                      <i className="bi bi-trash3" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                  </div>

                  <h6 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{habit.name}</h6>
                  {habit.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>{habit.description}</p>
                  )}

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="streak-badge"><i className="bi bi-fire"></i> {habit.streak} day streak</span>
                    {habit.longestStreak > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best: {habit.longestStreak}</span>
                    )}
                  </div>

                  <button
                    className="btn btn-sm w-100"
                    disabled={done || completing === habit._id}
                    onClick={() => handleComplete(habit._id)}
                    style={{
                      background: done ? 'rgba(16,185,129,0.15)' : 'var(--navy-500)',
                      border: `1px solid ${done ? 'var(--green-500)' : 'var(--border-color)'}`,
                      color: done ? 'var(--green-400)' : 'var(--text-secondary)',
                      fontWeight: 500, borderRadius: 8
                    }}
                  >
                    {completing === habit._id ? <span className="spinner-border spinner-border-sm" /> :
                      done ? <><i className="bi bi-check-circle-fill me-1"></i>Completed Today</> :
                        <><i className="bi bi-circle me-1"></i>Mark Complete</>
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block modal-dark" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Habit</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Habit Name</label>
                    <input type="text" className="form-control form-control-dark" placeholder="e.g. Save ₹100 daily"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Description</label>
                    <input type="text" className="form-control form-control-dark" placeholder="Optional description"
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Category</label>
                      <select className="form-select form-select-dark" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Frequency</label>
                      <select className="form-select form-select-dark" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                        {FREQ.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Target Amount per completion (₹) <span style={{ color: 'var(--text-muted)' }}>optional</span></label>
                    <input type="number" className="form-control form-control-dark" placeholder="e.g. 100"
                      value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--navy-500)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-cyan btn-sm" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm" /> : 'Create Habit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container-custom">
          <div className="p-3 rounded-3" style={{ background: 'var(--navy-500)', border: '1px solid var(--cyan-500)', color: 'var(--text-primary)', minWidth: 220 }}>
            <i className="bi bi-lightning-charge-fill me-2 text-amber"></i>{toast}
          </div>
        </div>
      )}
    </div>
  )
}
