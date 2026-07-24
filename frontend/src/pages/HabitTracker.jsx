import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'

const CATEGORIES = ['Saving', 'Budgeting', 'Investing', 'Tracking', 'Learning']
const FREQ = ['daily', 'weekly', 'monthly']
const CATEGORY_COLORS = {
  Saving: '#10b981', Budgeting: '#06b6d4',
  Investing: '#f59e0b', Tracking: '#8b5cf6', Learning: '#ef4444'
}

export default function HabitTracker() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [toast, setToast] = useState('')
  // FIXED: form uses 'name' not 'title', added proper fields matching backend model
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', category: 'Saving', targetAmount: '' })

  useEffect(() => { fetchHabits() }, [])

  const fetchHabits = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/habits`)
      setHabits(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // FIXED: sends 'name' not 'title', uses proper backend fields
  const addHabit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await axios.post(`${API}/habits`, {
        name: form.name,
        description: form.description,
        frequency: form.frequency,
        category: form.category,
        targetAmount: form.targetAmount || 0
      })
      setHabits(h => [res.data, ...h])
      setShowModal(false)
      setForm({ name: '', description: '', frequency: 'daily', category: 'Saving', targetAmount: '' })
      showToast('Habit added!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding habit')
    } finally { setSaving(false) }
  }

  const completeHabit = async (id) => {
    setCompleting(id)
    try {
      const res = await axios.post(`${API}/habits/${id}/complete`)
      setHabits(h => h.map(x => x._id === id ? res.data : x))
      showToast('Habit marked as complete! 🔥')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating habit')
    } finally { setCompleting(null) }
  }

  const deleteHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return
    try {
      await axios.delete(`${API}/habits/${id}`)
      setHabits(h => h.filter(x => x._id !== id))
      showToast('Habit deleted')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting habit')
    }
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const isCompletedToday = (habit) => {
    const today = new Date(); today.setHours(0,0,0,0)
    return habit.completions?.some(c => {
      const d = new Date(c.date); d.setHours(0,0,0,0)
      return d.getTime() === today.getTime()
    })
  }

  const completedToday = habits.filter(isCompletedToday).length
  const bestStreak = Math.max(...habits.map(h => h.streak || 0), 0)
  const activeStreaks = habits.filter(h => h.streak && h.streak > 0).length

  // FIXED: replaced Tailwind spinner with Bootstrap
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Habit Tracker</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Build positive daily routines</p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <i className="bi bi-plus-lg me-2"></i>New Habit
        </button>
      </div>

      {/* Stats - FIXED: Bootstrap grid instead of Tailwind */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Today', value: `${completedToday}/${habits.length}`, icon: 'bi-check-circle-fill', color: 'var(--color-secondary)' },
          { label: 'Best Streak', value: bestStreak, icon: 'bi-fire', color: 'var(--color-danger)' },
          { label: 'Active Streaks', value: activeStreaks, icon: 'bi-graph-up-arrow', color: 'var(--color-primary)' },
        ].map((s, i) => (
          <div className="col-4" key={i}>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }}></i>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Habits list - FIXED: removed Tailwind, fixed broken weekly progress bar */}
      {habits.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <i className="bi bi-emoji-smile" style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}></i>
          <h6 style={{ marginTop: '1rem' }}>No habits yet</h6>
          <p style={{ color: 'var(--color-text-muted)' }}>Start building better habits by adding your first one!</p>
          <button onClick={() => setShowModal(true)} style={{ ...btnPrimary, marginTop: '0.5rem' }}>
            <i className="bi bi-plus-lg me-1"></i>Add Habit
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {habits.map(habit => {
            const done = isCompletedToday(habit)
            const color = CATEGORY_COLORS[habit.category] || 'var(--color-primary)'

            // FIXED: replaced broken habit.completedDays with actual completions data
            const last7 = Array.from({ length: 7 }, (_, i) => {
              const day = new Date(); day.setHours(0,0,0,0)
              day.setDate(day.getDate() - (6 - i))
              return habit.completions?.some(c => {
                const d = new Date(c.date); d.setHours(0,0,0,0)
                return d.getTime() === day.getTime()
              }) || false
            })

            return (
              <div className="col-md-6 col-lg-4" key={habit._id}>
                <div style={{
                  ...cardStyle,
                  borderColor: done ? 'var(--color-secondary)' : 'var(--color-border)',
                  background: done ? 'rgba(16,185,129,0.04)' : 'var(--color-bg-card)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: `${color}20`, color, border: `1px solid ${color}40` }}>
                        {habit.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{habit.frequency}</span>
                    </div>
                    <button onClick={() => deleteHabit(habit._id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}>
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>

                  {/* FIXED: uses habit.name not habit.title */}
                  <h6 style={{ fontWeight: 600, marginBottom: 4 }}>{habit.name}</h6>
                  {habit.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>{habit.description}</p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: 'var(--color-accent)', border: '1px solid rgba(245,158,11,0.25)', animation: 'streakPulse 2s ease-in-out infinite' }}>
                      <i className="bi bi-fire"></i> {habit.streak || 0} day streak
                    </span>
                    {habit.longestStreak > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Best: {habit.longestStreak}</span>
                    )}
                  </div>

                  {/* FIXED: weekly progress using actual completions data */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Weekly Progress</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Last 7 days</span>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {last7.map((completed, i) => (
                        <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: completed ? color : 'var(--color-bg-tertiary)', transition: 'background 0.2s' }} />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      onClick={() => completeHabit(habit._id)}
                      disabled={done || completing === habit._id}
                      style={{
                        padding: '0.4rem 0.9rem', borderRadius: '0.5rem', fontWeight: 500, fontSize: '0.82rem', cursor: done ? 'default' : 'pointer',
                        background: done ? 'rgba(16,185,129,0.12)' : 'var(--color-bg-secondary)',
                        border: `1px solid ${done ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                        color: done ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                        display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s'
                      }}
                    >
                      {completing === habit._id
                        ? <span className="spinner-border spinner-border-sm" />
                        : done
                          ? <><i className="bi bi-check-circle-fill"></i>Done</>
                          : <><i className="bi bi-circle"></i>Mark Done</>
                      }
                    </button>
                    <button onClick={() => deleteHabit(habit._id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Delete <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal - FIXED: replaced Tailwind with inline styles, fixed form fields */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h5 style={{ fontWeight: 700, margin: 0 }}>New Habit</h5>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={addHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Habit Name</label>
                {/* FIXED: uses name not title */}
                <input type="text" style={inputStyle} placeholder="e.g. Save ₹100 daily, Morning exercise"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Description <span style={{ color: 'var(--color-text-muted)' }}>optional</span></label>
                <input type="text" style={inputStyle} placeholder="Brief description of the habit"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label style={labelStyle}>Frequency</label>
                  <select style={inputStyle} value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                    {FREQ.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Target Amount per completion (₹) <span style={{ color: 'var(--color-text-muted)' }}>optional</span></label>
                <input type="number" style={inputStyle} placeholder="e.g. 100"
                  value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? <span className="spinner-border spinner-border-sm" /> : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast - FIXED: replaced Tailwind with inline styles */}
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
const inputStyle = { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none' }
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }
const btnPrimary = { background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: '#0a0e1a', fontWeight: 600, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }
const btnSecondary = { background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }
