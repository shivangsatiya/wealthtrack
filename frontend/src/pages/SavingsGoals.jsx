import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'

const CATEGORIES = ['Emergency Fund','Vacation','Education','Vehicle','Home','Retirement','Gadget','Other']
const ICONS = { 'Emergency Fund':'🛡️', Vacation:'✈️', Education:'🎓', Vehicle:'🚗', Home:'🏠', Retirement:'👴', Gadget:'💻', Other:'🎯' }

export default function SavingsGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [contributeGoal, setContributeGoal] = useState(null)
  const [contributeAmount, setContributeAmount] = useState('')
  const [contributeNote, setContributeNote] = useState('')
  const [form, setForm] = useState({ title: '', description: '', targetAmount: '', deadline: '', category: 'Other' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const fetchGoals = async () => {
    setLoading(true)
    try { const res = await axios.get(`${API}/goals`); setGoals(res.data) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchGoals() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const icon = ICONS[form.category] || '🎯'
      await axios.post(`${API}/goals`, { ...form, icon })
      setShowModal(false)
      setForm({ title: '', description: '', targetAmount: '', deadline: '', category: 'Other' })
      showToast('Goal created!'); fetchGoals()
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleContribute = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await axios.post(`${API}/goals/${contributeGoal._id}/contribute`, { amount: Number(contributeAmount), note: contributeNote })
      setGoals(g => g.map(x => x._id === contributeGoal._id ? res.data : x))
      setContributeGoal(null); setContributeAmount(''); setContributeNote('')
      showToast(res.data.isCompleted ? '🎉 Goal completed!' : 'Contribution added!')
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    await axios.delete(`${API}/goals/${id}`)
    setGoals(g => g.filter(x => x._id !== id))
    showToast('Goal deleted')
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)
  const completed = goals.filter(g => g.isCompleted).length

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Set targets and track your progress</p>
        </div>
        <button className="btn btn-cyan" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>New Goal
        </button>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Target', value: fmt(totalTarget), icon: 'bi-bullseye', color: 'var(--cyan-500)' },
          { label: 'Total Saved', value: fmt(totalSaved), icon: 'bi-piggy-bank-fill', color: 'var(--green-400)' },
          { label: 'Goals Completed', value: completed, icon: 'bi-trophy-fill', color: 'var(--amber-400)' },
        ].map((s, i) => (
          <div className="col-4" key={i}>
            <div className="stat-card text-center">
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }}></i>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border spinner-cyan" /></div>
      ) : goals.length === 0 ? (
        <div className="card-dark text-center py-5">
          <span style={{ fontSize: '3rem' }}>🎯</span>
          <p className="mt-3" style={{ color: 'var(--text-muted)' }}>No savings goals yet. Create your first one!</p>
          <button className="btn btn-cyan mt-2" onClick={() => setShowModal(true)}>Create Goal</button>
        </div>
      ) : (
        <div className="row g-3">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null
            return (
              <div className="col-md-6" key={goal._id}>
                <div className={`goal-card ${goal.isCompleted ? '' : ''}`} style={{ border: goal.isCompleted ? '1px solid var(--green-500)' : '1px solid var(--border-color)' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.5rem' }}>{goal.icon}</span>
                      <div>
                        <h6 style={{ fontWeight: 600, marginBottom: 2 }}>{goal.title}</h6>
                        <span className="badge rounded-pill badge-cyan" style={{ fontSize: '0.7rem' }}>{goal.category}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      {!goal.isCompleted && (
                        <button className="btn btn-sm btn-cyan" style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                          onClick={() => setContributeGoal(goal)}>
                          Add
                        </button>
                      )}
                      <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '3px 6px' }}
                        onClick={() => handleDelete(goal._id)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>{goal.description}</p>
                  )}

                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: '0.85rem', color: 'var(--cyan-500)', fontWeight: 600 }}>{fmt(goal.savedAmount)}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fmt(goal.targetAmount)}</span>
                  </div>
                  <div className="progress-dark mb-2">
                    <div className={`${goal.isCompleted ? 'progress-bar-green' : 'progress-bar-cyan'}`}
                      style={{ width: `${pct}%`, height: '100%', borderRadius: 999, transition: 'width 0.5s' }} />
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: '0.75rem', color: pct >= 100 ? 'var(--green-400)' : 'var(--text-secondary)', fontWeight: 500 }}>
                      {pct}% {goal.isCompleted ? '✅ Completed!' : 'achieved'}
                    </span>
                    {daysLeft !== null && (
                      <span style={{ fontSize: '0.7rem', color: daysLeft < 0 ? 'var(--red-400)' : daysLeft < 30 ? 'var(--amber-400)' : 'var(--text-muted)' }}>
                        <i className="bi bi-calendar3 me-1"></i>
                        {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="modal show d-block modal-dark" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Savings Goal</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Goal Title</label>
                    <input type="text" className="form-control form-control-dark" placeholder="e.g. Emergency Fund"
                      value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Target Amount (₹)</label>
                      <input type="number" className="form-control form-control-dark" placeholder="50000"
                        value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required min="1" />
                    </div>
                    <div className="col-6">
                      <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Category</label>
                      <select className="form-select form-select-dark" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{ICONS[c]} {c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Target Deadline <span style={{ color: 'var(--text-muted)' }}>optional</span></label>
                    <input type="date" className="form-control form-control-dark"
                      value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Description <span style={{ color: 'var(--text-muted)' }}>optional</span></label>
                    <input type="text" className="form-control form-control-dark" placeholder="Why this goal?"
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--navy-500)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-cyan btn-sm" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm" /> : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoal && (
        <div className="modal show d-block modal-dark" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{contributeGoal.icon} Add to {contributeGoal.title}</h5>
                <button className="btn-close btn-close-white" onClick={() => setContributeGoal(null)} />
              </div>
              <form onSubmit={handleContribute}>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: 'var(--text-muted)' }}>Remaining</span>
                      <span style={{ color: 'var(--cyan-500)', fontWeight: 600 }}>
                        {fmt(contributeGoal.targetAmount - contributeGoal.savedAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Amount to Add (₹)</label>
                    <input type="number" className="form-control form-control-dark" placeholder="e.g. 5000"
                      value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} required min="1" autoFocus />
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Note <span style={{ color: 'var(--text-muted)' }}>optional</span></label>
                    <input type="text" className="form-control form-control-dark" placeholder="e.g. Monthly savings"
                      value={contributeNote} onChange={e => setContributeNote(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--navy-500)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => setContributeGoal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-cyan btn-sm" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Contribution'}
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
            <i className="bi bi-check-circle-fill me-2 text-cyan"></i>{toast}
          </div>
        </div>
      )}
    </div>
  )
}
