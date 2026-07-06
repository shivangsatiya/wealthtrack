import { useState } from 'react'
import axios from 'axios'
import { useAuth, API } from '../context/AuthContext'

const OCCUPATIONS = ['Student','Software Engineer','Business Owner','Freelancer','Doctor','Teacher','Government Employee','Other']
const CURRENCIES = ['INR','USD','EUR','GBP','AED']

export default function Profile() {
  const { user, login } = useAuth()
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
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const setProfileField = (key, val) => setForm(f => ({ ...f, profile: { ...f.profile, [key]: val } }))

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your financial profile</p>
      </div>

      <div className="row g-4">
        {/* Avatar card */}
        <div className="col-md-4">
          <div className="card-dark p-4 text-center">
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--navy-500)', border: '3px solid var(--cyan-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'var(--cyan-500)',
              margin: '0 auto 1rem'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h5 style={{ fontWeight: 700 }}>{user?.name}</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
            <span className="badge rounded-pill" style={{
              background: user?.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'var(--cyan-glow)',
              color: user?.role === 'admin' ? 'var(--purple-500)' : 'var(--cyan-500)',
              border: `1px solid ${user?.role === 'admin' ? 'rgba(139,92,246,0.3)' : 'rgba(0,198,215,0.3)'}`,
              fontSize: '0.75rem', textTransform: 'capitalize'
            }}>
              {user?.role}
            </span>

            <div className="glow-divider mt-3" />

            <div className="mt-3 text-start">
              {[
                { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                { label: 'Currency', value: user?.profile?.currency || 'INR' },
                { label: 'Monthly Income', value: user?.profile?.monthlyIncome ? `₹${Number(user.profile.monthlyIncome).toLocaleString('en-IN')}` : 'Not set' },
              ].map((item, i) => (
                <div key={i} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="col-md-8">
          <div className="card-dark p-4">
            <h6 className="mb-4" style={{ fontWeight: 600, color: 'var(--cyan-500)' }}>
              <i className="bi bi-pencil-square me-2"></i>Edit Profile
            </h6>
            <form onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full Name</label>
                  <input type="text" className="form-control form-control-dark"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Phone</label>
                  <input type="tel" className="form-control form-control-dark" placeholder="+91 XXXXXXXXXX"
                    value={form.profile.phone} onChange={e => setProfileField('phone', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Occupation</label>
                  <select className="form-select form-select-dark" value={form.profile.occupation} onChange={e => setProfileField('occupation', e.target.value)}>
                    <option value="">Select occupation</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monthly Income (₹)</label>
                  <input type="number" className="form-control form-control-dark" placeholder="e.g. 50000"
                    value={form.profile.monthlyIncome} onChange={e => setProfileField('monthlyIncome', e.target.value)} min="0" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Preferred Currency</label>
                  <select className="form-select form-select-dark" value={form.profile.currency} onChange={e => setProfileField('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Financial Goal Summary</label>
                  <textarea className="form-control form-control-dark" rows={3}
                    placeholder="e.g. I want to save ₹5L in 2 years, pay off my loan, and start investing in mutual funds."
                    value={form.profile.financialGoalSummary}
                    onChange={e => setProfileField('financialGoalSummary', e.target.value)} />
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="btn btn-cyan px-4" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2-circle me-2"></i>Save Changes</>}
                </button>
              </div>
            </form>
          </div>

          {/* Security section */}
          <div className="card-dark p-4 mt-3">
            <h6 className="mb-3" style={{ fontWeight: 600 }}>
              <i className="bi bi-shield-lock me-2 text-cyan"></i>Account Security
            </h6>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</div>
              </div>
              <span className="badge badge-green rounded-pill">Verified</span>
            </div>
            <div className="glow-divider" />
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Last changed: Account creation</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>••••••••</span>
            </div>
          </div>
        </div>
      </div>

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
