import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'
import useCountUp from '../hooks/useCountUp'

const EXPENSE_CATS = ['Food & Dining','Transport','Rent & Housing','Entertainment','Shopping','Healthcare','Education','Utilities','Personal Care','Other Expense']
const INCOME_CATS = ['Salary','Freelance','Investment Returns','Business','Gift','Other Income']

function SummaryCard({ label, value, color, icon }) {
  const count = useCountUp(value)
  const [hovered, setHovered] = useState(false)
  return (
    <div className="col-4">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...cardStyle,
          textAlign: 'center',
          borderColor: hovered ? color : 'var(--color-border)',
          boxShadow: hovered ? `0 0 28px ${color}30, 0 6px 24px rgba(0,0,0,0.35)` : 'none',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.25s'
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: '1.4rem', color, transform: hovered ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s', display: 'block' }}></i>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color, marginTop: 6, textShadow: hovered ? `0 0 16px ${color}50` : 'none', transition: 'all 0.3s', overflowWrap: 'break-word' }}>
          ₹{count.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({ type: '', category: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const fetchTx = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.month) params.append('month', filters.month)
      if (filters.year) params.append('year', filters.year)
      params.append('limit', '100')
      const res = await axios.get(`${API}/transactions?${params}`)
      setTransactions(res.data)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchTx() }, [fetchTx])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await axios.post(`${API}/transactions`, form)
      showToast('Transaction added!')
      setShowModal(false)
      setForm({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] })
      fetchTx()
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await axios.delete(`${API}/transactions/${id}`)
      setTransactions(t => t.filter(x => x._id !== id))
      showToast('Deleted')
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense
  const categories = form.type === 'expense' ? EXPENSE_CATS : INCOME_CATS

  return (
    <div>
      <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Expense Tracker</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Track your income and expenses</p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <i className="bi bi-plus-lg me-2"></i>Add Transaction
        </button>
      </div>

      <div className="row g-3 mb-4">
        <SummaryCard label="Income" value={totalIncome} color="var(--color-primary)" icon="bi-arrow-down-circle" />
        <SummaryCard label="Expenses" value={totalExpense} color="var(--color-danger)" icon="bi-arrow-up-circle" />
        <SummaryCard label="Balance" value={Math.abs(balance)} color={balance >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)'} icon="bi-wallet2" />
      </div>

      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <div className="row g-2 align-items-end">
          <div className="col-6 col-md-3">
            <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Type</label>
            <select style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Month</label>
            <select style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={m} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label style={{ ...labelStyle, fontSize: '0.78rem' }}>Year</label>
            <select style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })}>
              {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button onClick={() => setFilters({ type: '', category: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })}
              style={{ ...btnSecondary, width: '100%', padding: '0.5rem' }}>
              <i className="bi bi-x-lg me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner-border" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <i className="bi bi-receipt" style={{ fontSize: '2.5rem' }}></i>
            <p style={{ marginTop: '1rem' }}>No transactions found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)' }}>
                  {['Date','Type','Category','Description','Amount',''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={tdStyle}>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: tx.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: tx.type === 'income' ? 'var(--color-secondary)' : 'var(--color-danger)', border: `1px solid ${tx.type === 'income' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={tdStyle}>{tx.category}</td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{tx.description || '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: tx.type === 'income' ? 'var(--color-secondary)' : 'var(--color-danger)' }}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDelete(tx._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h5 style={{ fontWeight: 700, margin: 0 }}>Add Transaction</h5>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['expense','income'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm({ ...form, type: t, category: '' })}
                      style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', background: form.type === t ? (t === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : 'var(--color-bg-secondary)', border: `1px solid ${form.type === t ? (t === 'income' ? 'var(--color-secondary)' : 'var(--color-danger)') : 'var(--color-border)'}`, color: form.type === t ? (t === 'income' ? 'var(--color-secondary)' : 'var(--color-danger)') : 'var(--color-text-muted)' }}>
                      {t === 'income' ? '↓ Income' : '↑ Expense'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Amount (₹)</label>
                <input type="number" style={inputStyle} placeholder="0.00" min="1"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input type="text" style={inputStyle} placeholder="Optional note"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" style={inputStyle}
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
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

const cardStyle = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '1.25rem' }
const inputStyle = { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none' }
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.875rem', verticalAlign: 'middle' }
const btnPrimary = { background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: '#0a0e1a', fontWeight: 600, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }
const btnSecondary = { background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }
