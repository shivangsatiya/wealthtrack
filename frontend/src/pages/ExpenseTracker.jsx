import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API } from '../context/AuthContext'

const EXPENSE_CATS = ['Food & Dining','Transport','Rent & Housing','Entertainment','Shopping','Healthcare','Education','Utilities','Personal Care','Other Expense']
const INCOME_CATS = ['Salary','Freelance','Investment Returns','Business','Gift','Other Income']

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
    } finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchTx() }, [fetchTx])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await axios.post(`${API}/transactions`, form)
      showToast('Transaction added!'); setShowModal(false)
      setForm({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] })
      fetchTx()
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await axios.delete(`${API}/transactions/${id}`)
    setTransactions(t => t.filter(x => x._id !== id))
    showToast('Deleted')
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

  const categories = form.type === 'expense' ? EXPENSE_CATS : INCOME_CATS

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Expense Tracker</h1>
          <p className="page-subtitle">Track your income and expenses</p>
        </div>
        <button className="btn btn-cyan" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Transaction
        </button>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Income', value: fmt(totalIncome), color: 'var(--green-400)', icon: 'bi-arrow-down-circle' },
          { label: 'Expenses', value: fmt(totalExpense), color: 'var(--red-400)', icon: 'bi-arrow-up-circle' },
          { label: 'Balance', value: fmt(totalIncome - totalExpense), color: totalIncome >= totalExpense ? 'var(--cyan-500)' : 'var(--red-400)', icon: 'bi-wallet2' },
        ].map((s, i) => (
          <div className="col-4" key={i}>
            <div className="stat-card text-center">
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.4rem', color: s.color }}></i>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-dark p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-6 col-md-3">
            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Type</label>
            <select className="form-select form-select-dark form-select-sm" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Month</label>
            <select className="form-select form-select-dark form-select-sm" value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={m} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Year</label>
            <select className="form-select form-select-dark form-select-sm" value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })}>
              {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button className="btn btn-sm w-100" style={{ background: 'var(--navy-500)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              onClick={() => setFilters({ type: '', category: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })}>
              <i className="bi bi-x-lg me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-dark">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border spinner-cyan" /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-receipt" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No transactions found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom mb-0">
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge rounded-pill ${tx.type === 'income' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{tx.category}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tx.description || '—'}</td>
                    <td style={{ fontWeight: 600, color: tx.type === 'income' ? 'var(--green-400)' : 'var(--red-400)' }}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </td>
                    <td>
                      <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--red-400)', padding: '2px 8px' }}
                        onClick={() => handleDelete(tx._id)}>
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

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block modal-dark" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Transaction</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Type</label>
                    <div className="d-flex gap-2">
                      {['expense','income'].map(t => (
                        <button key={t} type="button"
                          className="btn btn-sm flex-fill"
                          style={{
                            background: form.type === t ? (t === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'var(--navy-500)',
                            border: `1px solid ${form.type === t ? (t === 'income' ? 'var(--green-500)' : 'var(--red-500)') : 'var(--border-color)'}`,
                            color: form.type === t ? (t === 'income' ? 'var(--green-400)' : 'var(--red-400)') : 'var(--text-secondary)',
                            fontWeight: form.type === t ? 600 : 400
                          }}
                          onClick={() => setForm({ ...form, type: t, category: '' })}>
                          {t === 'income' ? '↓ Income' : '↑ Expense'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Amount (₹)</label>
                    <input type="number" className="form-control form-control-dark" placeholder="0.00" min="1"
                      value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Category</label>
                    <select className="form-select form-select-dark" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Description</label>
                    <input type="text" className="form-control form-control-dark" placeholder="Optional note"
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Date</label>
                    <input type="date" className="form-control form-control-dark"
                      value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--navy-500)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-cyan btn-sm" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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
