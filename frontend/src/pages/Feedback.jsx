import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'

const TYPES = ['General Feedback', 'Bug Report', 'Feature Request', 'Complaint', 'Other']

const STATUS_STYLES = {
  Pending:  { bg: 'rgba(245,158,11,0.12)',  color: 'var(--color-accent)',    border: 'rgba(245,158,11,0.3)' },
  Reviewed: { bg: 'rgba(6,182,212,0.12)',   color: 'var(--color-primary)',  border: 'rgba(6,182,212,0.3)' },
  Resolved: { bg: 'rgba(16,185,129,0.12)',  color: 'var(--color-secondary)', border: 'rgba(16,185,129,0.3)' },
}

export default function Feedback() {
  const [myFeedback, setMyFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  // FIXED: removed unused showPassword and showConfirm state variables
  const [form, setForm] = useState({ type: 'General Feedback', subject: '', message: '' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchMine = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/feedback/mine`)
      setMyFeedback(res.data)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchMine() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${API}/feedback`, form)
      setForm({ type: 'General Feedback', subject: '', message: '' })
      showToast("Feedback submitted! We'll get back to you.")
      fetchMine()
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner-border" style={{ color: 'var(--color-primary)' }} />
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Feedback & Support</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Share your thoughts, report issues, or request features</p>
      </div>

      <div className="row g-4">
        {/* Submit form */}
        <div className="col-lg-5">
          <div style={cardStyle}>
            <h6 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>
              <i className="bi bi-chat-square-text-fill me-2" style={{ color: 'var(--color-primary)' }}></i>Send us a message
            </h6>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <input type="text" style={inputStyle} placeholder="Brief summary of your message"
                  value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                  placeholder="Describe your feedback, issue, or request in detail..."
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button type="submit" disabled={submitting} style={btnPrimary}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                  : <><i className="bi bi-send-fill me-2"></i>Submit Feedback</>
                }
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              {[
                { icon: 'bi-lightning-charge-fill', text: 'Bug reports are reviewed within 24 hours' },
                { icon: 'bi-star-fill', text: 'Feature requests help shape our roadmap' },
                { icon: 'bi-shield-check-fill', text: 'All feedback is confidential' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  <i className={`bi ${item.icon}`} style={{ color: 'var(--color-primary)' }}></i>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My submissions */}
        <div className="col-lg-7">
          <div style={cardStyle}>
            <h6 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>
              <i className="bi bi-clock-history me-2" style={{ color: 'var(--color-primary)' }}></i>Your Submissions
            </h6>

            {myFeedback.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)' }}></i>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', marginBottom: 0 }}>No submissions yet. Send us your first message!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myFeedback.map(fb => {
                  const s = STATUS_STYLES[fb.status] || STATUS_STYLES.Pending
                  return (
                    <div key={fb._id} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fb.subject}</span>
                          <span style={{ marginLeft: 8, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(6,182,212,0.2)' }}>
                            {fb.type}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {fb.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: fb.adminNote ? 8 : 0 }}>{fb.message}</p>
                      {fb.adminNote && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 6, fontSize: '0.8rem' }}>
                          <i className="bi bi-person-badge-fill me-1" style={{ color: 'var(--color-primary)' }}></i>
                          <strong>Admin:</strong> {fb.adminNote}
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
                        Submitted on {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

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
const btnPrimary = { width: '100%', padding: '0.75rem', background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: '#0a0e1a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
