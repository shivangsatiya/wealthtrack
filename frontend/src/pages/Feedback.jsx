import { useState, useEffect } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'

const TYPES = ['General Feedback', 'Bug Report', 'Feature Request', 'Complaint', 'Other']

const STATUS_COLORS = {
  Pending: { bg: 'rgba(245,158,11,0.12)', color: 'var(--amber-400)', border: 'rgba(245,158,11,0.3)' },
  Reviewed: { bg: 'rgba(0,198,215,0.12)', color: 'var(--cyan-500)', border: 'rgba(0,198,215,0.3)' },
  Resolved: { bg: 'rgba(16,185,129,0.12)', color: 'var(--green-400)', border: 'rgba(16,185,129,0.3)' },
}

export default function Feedback() {
  const [myFeedback, setMyFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ type: 'General Feedback', subject: '', message: '' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchMine = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/feedback/mine`)
      setMyFeedback(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchMine() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${API}/feedback`, form)
      setForm({ type: 'General Feedback', subject: '', message: '' })
      showToast('Feedback submitted! We\'ll get back to you.')
      fetchMine()
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Feedback & Support</h1>
        <p className="page-subtitle">Share your thoughts, report issues, or request features</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card-dark p-4">
            <h6 className="mb-4" style={{ fontWeight: 600 }}>
              <i className="bi bi-chat-square-text-fill me-2 text-cyan"></i>Send us a message
            </h6>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Type</label>
                <select className="form-select form-select-dark" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Subject</label>
                <input type="text" className="form-control form-control-dark"
                  placeholder="Brief summary of your message"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required />
              </div>
              <div className="mb-4">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Message</label>
                <textarea className="form-control form-control-dark" rows={5}
                  placeholder="Describe your feedback, issue, or request in detail..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required />
              </div>
              <button type="submit" className="btn btn-cyan w-100" disabled={submitting}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                  : <><i className="bi bi-send-fill me-2"></i>Submit Feedback</>}
              </button>
            </form>
            <div className="mt-4">
              <div className="glow-divider" />
              <div className="mt-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {[
                  { icon: 'bi-lightning-charge-fill', text: 'Bug reports are reviewed within 24 hours' },
                  { icon: 'bi-star-fill', text: 'Feature requests help shape our roadmap' },
                  { icon: 'bi-shield-check-fill', text: 'All feedback is confidential and reviewed by our team' },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-2">
                    <i className={`bi ${item.icon} text-cyan`}></i>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card-dark p-4">
            <h6 className="mb-4" style={{ fontWeight: 600 }}>
              <i className="bi bi-clock-history me-2 text-cyan"></i>Your Submissions
            </h6>
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border spinner-cyan" /></div>
            ) : myFeedback.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
                <p className="mt-3" style={{ color: 'var(--text-muted)' }}>No submissions yet. Send us your first message!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myFeedback.map(fb => {
                  const s = STATUS_COLORS[fb.status] || STATUS_COLORS.Pending
                  return (
                    <div key={fb._id} style={{
                      background: 'var(--navy-600)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10, padding: '1rem 1.25rem'
                    }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fb.subject}</span>
                          <span className="ms-2 badge rounded-pill"
                            style={{ background: 'var(--cyan-glow)', color: 'var(--cyan-500)', border: '1px solid rgba(0,198,215,0.3)', fontSize: '0.7rem' }}>
                            {fb.type}
                          </span>
                        </div>
                        <span className="badge rounded-pill"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '0.7rem' }}>
                          {fb.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: fb.adminNote ? 8 : 0 }}>
                        {fb.message}
                      </p>
                      {fb.adminNote && (
                        <div style={{
                          marginTop: 8, padding: '8px 12px',
                          background: 'rgba(0,198,215,0.06)',
                          border: '1px solid rgba(0,198,215,0.15)',
                          borderRadius: 6, fontSize: '0.8rem'
                        }}>
                          <i className="bi bi-person-badge-fill me-1 text-cyan"></i>
                          <span style={{ color: 'var(--text-secondary)' }}><strong>Admin:</strong> {fb.adminNote}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
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
        <div className="toast-container-custom">
          <div className="p-3 rounded-3" style={{ background: 'var(--navy-500)', border: '1px solid var(--cyan-500)', color: 'var(--text-primary)', minWidth: 240 }}>
            <i className="bi bi-check-circle-fill me-2 text-cyan"></i>{toast}
          </div>
        </div>
      )}
    </div>
  )
}