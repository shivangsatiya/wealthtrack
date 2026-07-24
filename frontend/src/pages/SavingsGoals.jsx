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
    catch (err) { console.error(err) }
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
      const res = await axios.post(`${API}/goals/${contributeGoal._id}/contribute`, {
        amount: Number(contributeAmount), note: contributeNote
      })
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
  // ✅ FIXED: was showing $ instead of count
  const completed = goals.filter(g => g.isCompleted).length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner-border" style={{ color: 'var(--color-primary)' }} />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Savings Goals</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Set targets and track your progress</p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <i className="bi bi-plus-lg me-2"></i>New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Target', value: fmt(totalTarget), icon: 'bi-bullseye', color: 'var(--color-primary)' },
          { label: 'Total Saved', value: fmt(totalSaved), icon: 'bi-piggy-bank-fill', color: 'var(--color-secondary)' },
          { label: 'Goals Completed', value: completed, icon: 'bi-trophy-fill', color: 'var(--color-accent)' },
        ].map((s, i) => (
          <div className="col-4" key={i}>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }}></i>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: '3rem' }}>🎯</span>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No savings goals yet. Create your first one!</p>
          <button onClick={() => setShowModal(true)} style={{ ...btnPrimary, marginTop: '0.5rem' }}>Create Goal</button>
        </div>
      ) : (
        <div className="row g-3">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null
            return (
              <div className="col-md-6" key={goal._id}>
                <div style={{
                  ...cardStyle,
                  borderColor: goal.isCompleted ? 'var(--color-secondary)' : 'var(--color-border)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.5rem' }}>{goal.icon}</span>
                      <div>
                        <h6 style={{ fontWeight: 600, margin: 0 }}>{goal.title}</h6>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(6,182,212,0.2)' }}>
                          {goal.category}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!goal.isCompleted && (
                        <button onClick={() => setContributeGoal(goal)} style={{ ...btnPrimary, fontSize: '0.75rem', padding: '4px 12px' }}>Add</button>
                      )}
                      <button onClick={() => handleDelete(goal._id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>{goal.description}</p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>{fmt(goal.savedAmount)}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{fmt(goal.targetAmount)}</span>
                  </div>
                  <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 999,
                      background: goal.isCompleted
                        ? 'linear-gradient(90deg, var(--color-secondary), #34d399)'
                        : 'linear-gradient(90deg, var(--color-primary), #22d3ee)',
                      transition: 'width 0.5s'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: goal.isCompleted ? 'var(--color-secondary)' : 'var(--color-text-muted)', fontWeight: 500 }}>
                      {pct}% {goal.isCompleted ? '✅ Completed!' : 'achieved'}
                    </span>
                    {daysLeft !== null && (
                      <span style={{ fontSize: '0.7rem', color: daysLeft < 0 ? 'var(--color-danger)' : daysLeft < 30 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
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
        <div style={modalOverlay}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 480 }}>
            <div style={modalHeader}>
              <h5 style={{ fontWeight: 700, margin: 0 }}>Create Savings Goal</h5>
              <button onClick={() => setShowModal(false)} style={closeBtn}><i className="bi bi-x-lg"></i></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Goal Title</label>
                <input type="text" style={inputStyle} placeholder="e.g. Emergency Fund"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label style={labelStyle}>Target Amount (₹)</label>
                  <input type="number" style={inputStyle} placeholder="50000"
                    value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required min="1" />
                </div>
                <div className="col-6">
                  {/* ✅ FIXED: was broken icon picker, now proper category dropdown */}
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{ICONS[c]} {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Target Deadline <span style={{ color: 'var(--color-text-muted)' }}>optional</span></label>
                <input type="date" style={inputStyle}
                  value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Description <span style={{ color: 'var(--color-text-muted)' }}>optional</span></label>
                <input type="text" style={inputStyle} placeholder="Why this goal?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? <span className="spinner-border spinner-border-sm" /> : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoal && (
        <div style={modalOverlay}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 420 }}>
            <div style={modalHeader}>
              <h5 style={{ fontWeight: 700, margin: 0 }}>{contributeGoal.icon} Add to {contributeGoal.title}</h5>
              <button onClick={() => setContributeGoal(null)} style={closeBtn}><i className="bi bi-x-lg"></i></button>
            </div>
            <form onSubmit={handleContribute} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Remaining</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  {fmt(contributeGoal.targetAmount - contributeGoal.savedAmount)}
                </span>
              </div>
              <div>
                <label style={labelStyle}>Amount to Add (₹)</label>
                <input type="number" style={inputStyle} placeholder="e.g. 5000"
                  value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} required min="1" autoFocus />
              </div>
              <div>
                <label style={labelStyle}>Note <span style={{ color: 'var(--color-text-muted)' }}>optional</span></label>
                <input type="text" style={inputStyle} placeholder="e.g. Monthly savings"
                  value={contributeNote} onChange={e => setContributeNote(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setContributeGoal(null)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
            <i className="bi bi-check-circle-fill" style={{ color: 'var(--color-primary)' }}></i>{toast}
          </div>
        </div>
      )}
    </div>
  )
}

const cardStyle = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '1.25rem' }
const inputStyle = { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none' }
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }
const btnPrimary = { background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: '#0a0e1a', fontWeight: 600, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }
const btnSecondary = { background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }
const closeBtn = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }
