import { useState } from 'react'
import axios from 'axios'
import { useAuth, API } from '../context/AuthContext'

const OCCUPATIONS = ['Student','Software Engineer','Business Owner','Freelancer','Doctor','Teacher','Government Employee','Other']
const CURRENCIES = ['INR','USD','EUR','GBP','AED']

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    profile: {
      phone: user?.profile?.phone || '',
      occupation: user?.profile?.occupation || '',
      monthlyIncome: user?.profile?.monthlyIncome || '',
      currency: user?.profile?.currency || 'INR',
      financialGoalSummary: user?.profile?.financialGoalSummary || ''
    }
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await axios.put(`${API}/profile`, form)
      showToast('Profile updated!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving profile')
    } finally { setSaving(false) }
  }

  const setProfileField = (key, val) => setForm(f => ({ ...f, profile: { ...f.profile, [key]: val } }))

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Profile</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Manage your financial profile</p>
      </div>

      {/* FIXED: removed Tailwind grid, using Bootstrap grid */}
      <div className="row g-4">
        {/* Avatar card */}
        <div className="col-md-4">
          <div className="hover-card" style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(6,182,212,0.1)',
              border: '3px solid var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)',
              margin: '0 auto 1rem'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>{user?.name}</h5>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>{user?.email}</p>
            <span style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: 999,
              fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
              background: user?.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(6,182,212,0.12)',
              color: user?.role === 'admin' ? '#8b5cf6' : 'var(--color-primary)',
              border: `1px solid ${user?.role === 'admin' ? 'rgba(139,92,246,0.3)' : 'rgba(6,182,212,0.3)'}`
            }}>
              {user?.role}
            </span>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              {[
                { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                { label: 'Currency', value: user?.profile?.currency || 'INR' },
                { label: 'Monthly Income', value: user?.profile?.monthlyIncome ? `₹${Number(user.profile.monthlyIncome).toLocaleString('en-IN')}` : 'Not set' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit form - FIXED: removed all Tailwind classes */}
        <div className="col-md-8">
          <div className="hover-card" style={cardStyle}>
            <h6 style={{ fontWeight: 600, marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
              <i className="bi bi-pencil-square me-2"></i>Edit Profile
            </h6>
            <form onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" style={inputStyle}
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" style={inputStyle} placeholder="+91 XXXXXXXXXX"
                    value={form.profile.phone} onChange={e => setProfileField('phone', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Occupation</label>
                  <select style={inputStyle} value={form.profile.occupation} onChange={e => setProfileField('occupation', e.target.value)}>
                    <option value="">Select occupation</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Monthly Income (₹)</label>
                  <input type="number" style={inputStyle} placeholder="e.g. 50000"
                    value={form.profile.monthlyIncome} onChange={e => setProfileField('monthlyIncome', e.target.value)} min="0" />
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Preferred Currency</label>
                  <select style={inputStyle} value={form.profile.currency} onChange={e => setProfileField('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label style={labelStyle}>Financial Goal Summary</label>
                  <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                    placeholder="e.g. I want to save ₹5L in 2 years, pay off my loan, and start investing."
                    value={form.profile.financialGoalSummary}
                    onChange={e => setProfileField('financialGoalSummary', e.target.value)} />
                </div>
              </div>
              {/* FIXED: was Tailwind btn class, now inline style button */}
              <div style={{ marginTop: '1.25rem' }}>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="bi bi-check2-circle me-2"></i>Save Changes</>
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Security section */}
          <div className="hover-card" style={{ ...cardStyle, marginTop: '1rem' }}>
            <h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>
              <i className="bi bi-shield-lock me-2" style={{ color: 'var(--color-primary)' }}></i>Account Security
            </h6>
            {[
              { label: 'Email', sub: user?.email, badge: 'Verified', badgeColor: 'var(--color-secondary)' },
              { label: 'Password', sub: 'Last changed: Account creation', badge: '••••••••', badgeColor: 'var(--color-text-muted)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i === 0 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.sub}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: item.badgeColor, fontWeight: 600 }}>{item.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
const btnPrimary = { background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: '#0a0e1a', fontWeight: 700, fontSize: '0.875rem', padding: '0.7rem 1.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }
