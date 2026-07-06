import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { API } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const ASSET_TYPES = ['Cash','Savings Account','Fixed Deposit','Stocks','Mutual Funds','Real Estate','Gold','Crypto','Other']
const LIABILITY_TYPES = ['Home Loan','Car Loan','Personal Loan','Credit Card','Education Loan','Other']

export default function WealthAnalytics() {
  const [wealth, setWealth] = useState(null)
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showLiabilityModal, setShowLiabilityModal] = useState(false)
  const [assetForm, setAssetForm] = useState({ name: '', type: 'Cash', value: '' })
  const [liabilityForm, setLiabilityForm] = useState({ name: '', type: 'Personal Loan', amount: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [w, s] = await Promise.all([
        axios.get(`${API}/wealth`),
        axios.get(`${API}/transactions/summary?year=${new Date().getFullYear()}`)
      ])
      setWealth(w.data); setSummary(s.data)
    } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

  const totalAssets = wealth?.assets?.reduce((s, a) => s + a.value, 0) || 0
  const totalLiabilities = wealth?.liabilities?.reduce((s, l) => s + l.amount, 0) || 0
  const netWorth = totalAssets - totalLiabilities

  // Net worth history chart
  const snapshots = wealth?.netWorthSnapshots?.slice(-12) || []
  const netWorthChartData = {
    labels: snapshots.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Net Worth',
      data: snapshots.map(s => s.netWorth),
      borderColor: '#00c6d7',
      backgroundColor: 'rgba(0,198,215,0.08)',
      tension: 0.4, fill: true, pointRadius: 4
    }]
  }

  // Monthly income vs expense
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Income',
        data: MONTHS.map((_, i) => summary.find(s => s._id.month === i+1 && s._id.type === 'income')?.total || 0),
        backgroundColor: 'rgba(0,198,215,0.7)', borderRadius: 6
      },
      {
        label: 'Expenses',
        data: MONTHS.map((_, i) => summary.find(s => s._id.month === i+1 && s._id.type === 'expense')?.total || 0),
        backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 6
      }
    ]
  }

  // Asset breakdown doughnut
  const assetGrouped = {}
  wealth?.assets?.forEach(a => { assetGrouped[a.type] = (assetGrouped[a.type] || 0) + a.value })
  const assetDoughnut = {
    labels: Object.keys(assetGrouped),
    datasets: [{
      data: Object.values(assetGrouped),
      backgroundColor: ['#00c6d7','#10b981','#f59e0b','#8b5cf6','#ef4444','#f97316','#06b6d4','#84cc16','#a78bfa'],
      borderColor: '#111827', borderWidth: 2
    }]
  }

  const chartOpts = (yFmt = true) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12 } } },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(0,198,215,0.05)' } },
      y: { ticks: { color: '#64748b', font: { size: 11 }, callback: yFmt ? v => `₹${(v/1000).toFixed(0)}k` : undefined }, grid: { color: 'rgba(0,198,215,0.05)' } }
    }
  })

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 10, padding: 8 } } },
    cutout: '65%'
  }

  const handleAddAsset = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await axios.post(`${API}/wealth/asset`, { ...assetForm, value: Number(assetForm.value) })
      setWealth(res.data); setShowAssetModal(false)
      setAssetForm({ name: '', type: 'Cash', value: '' }); showToast('Asset added!')
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleAddLiability = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await axios.post(`${API}/wealth/liability`, { ...liabilityForm, amount: Number(liabilityForm.amount) })
      setWealth(res.data); setShowLiabilityModal(false)
      setLiabilityForm({ name: '', type: 'Personal Loan', amount: '' }); showToast('Liability added!')
    } catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDeleteAsset = async (id) => {
    const res = await axios.delete(`${API}/wealth/asset/${id}`)
    setWealth(res.data); showToast('Asset removed')
  }

  const handleDeleteLiability = async (id) => {
    const res = await axios.delete(`${API}/wealth/liability/${id}`)
    setWealth(res.data); showToast('Liability removed')
  }

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}><div className="spinner-border spinner-cyan" /></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Wealth Analytics</h1>
        <p className="page-subtitle">Track your net worth and financial growth</p>
      </div>

      {/* Net worth hero */}
      <div className="card-dark p-4 mb-4" style={{ background: 'linear-gradient(135deg, rgba(0,198,215,0.08), rgba(13,18,38,0.95))', borderColor: 'rgba(0,198,215,0.25)' }}>
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Net Worth</div>
            <div className="net-worth-number">{fmt(netWorth)}</div>
            <div style={{ color: netWorth >= 0 ? 'var(--green-400)' : 'var(--red-400)', fontSize: '0.85rem', marginTop: 6 }}>
              <i className={`bi bi-arrow-${netWorth >= 0 ? 'up' : 'down'}-circle me-1`}></i>
              {netWorth >= 0 ? 'Positive net worth' : 'Liabilities exceed assets'}
            </div>
          </div>
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Total Assets</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green-400)' }}>{fmt(totalAssets)}</div>
          </div>
          <div className="col-md-4 text-center">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Total Liabilities</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red-400)' }}>{fmt(totalLiabilities)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        {['overview','assets','liabilities'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="btn btn-sm"
            style={{
              background: activeTab === tab ? 'var(--cyan-glow)' : 'var(--navy-600)',
              border: `1px solid ${activeTab === tab ? 'var(--cyan-500)' : 'var(--border-color)'}`,
              color: activeTab === tab ? 'var(--cyan-500)' : 'var(--text-secondary)',
              borderRadius: 8, fontWeight: activeTab === tab ? 600 : 400,
              textTransform: 'capitalize', padding: '6px 18px'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="card-dark p-3 mb-3">
              <h6 className="mb-3" style={{ fontWeight: 600 }}>Monthly Income vs Expenses ({new Date().getFullYear()})</h6>
              <div className="chart-container"><Bar data={barData} options={chartOpts()} /></div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card-dark p-3 mb-3">
              <h6 className="mb-3" style={{ fontWeight: 600 }}>Asset Allocation</h6>
              {Object.keys(assetGrouped).length > 0
                ? <div className="chart-container"><Doughnut data={assetDoughnut} options={doughnutOpts} /></div>
                : <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No assets yet</div>
              }
            </div>
          </div>
          {snapshots.length > 1 && (
            <div className="col-12">
              <div className="card-dark p-3">
                <h6 className="mb-3" style={{ fontWeight: 600 }}>Net Worth History</h6>
                <div className="chart-container"><Line data={netWorthChartData} options={chartOpts()} /></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assets' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ fontWeight: 600, marginBottom: 0 }}>Assets ({wealth?.assets?.length || 0})</h6>
            <button className="btn btn-sm btn-cyan" onClick={() => setShowAssetModal(true)}>
              <i className="bi bi-plus-lg me-1"></i>Add Asset
            </button>
          </div>
          {(wealth?.assets?.length || 0) === 0 ? (
            <div className="card-dark text-center py-5">
              <i className="bi bi-bank" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
              <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No assets added yet</p>
            </div>
          ) : (
            <div className="card-dark">
              <div className="table-responsive">
                <table className="table table-dark-custom mb-0">
                  <thead><tr><th>Name</th><th>Type</th><th>Value</th><th></th></tr></thead>
                  <tbody>
                    {wealth.assets.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 500 }}>{a.name}</td>
                        <td><span className="badge badge-cyan rounded-pill" style={{ fontSize: '0.7rem' }}>{a.type}</span></td>
                        <td style={{ color: 'var(--green-400)', fontWeight: 600 }}>{fmt(a.value)}</td>
                        <td>
                          <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--red-400)' }}
                            onClick={() => handleDeleteAsset(a._id)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--navy-700)' }}>
                      <td colSpan={2} style={{ fontWeight: 600 }}>Total</td>
                      <td style={{ color: 'var(--green-400)', fontWeight: 700 }}>{fmt(totalAssets)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'liabilities' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ fontWeight: 600, marginBottom: 0 }}>Liabilities ({wealth?.liabilities?.length || 0})</h6>
            <button className="btn btn-sm btn-cyan" onClick={() => setShowLiabilityModal(true)}>
              <i className="bi bi-plus-lg me-1"></i>Add Liability
            </button>
          </div>
          {(wealth?.liabilities?.length || 0) === 0 ? (
            <div className="card-dark text-center py-5">
              <i className="bi bi-credit-card" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
              <p className="mt-2" style={{ color: 'var(--text-muted)' }}>No liabilities added yet</p>
            </div>
          ) : (
            <div className="card-dark">
              <div className="table-responsive">
                <table className="table table-dark-custom mb-0">
                  <thead><tr><th>Name</th><th>Type</th><th>Amount</th><th></th></tr></thead>
                  <tbody>
                    {wealth.liabilities.map(l => (
                      <tr key={l._id}>
                        <td style={{ fontWeight: 500 }}>{l.name}</td>
                        <td><span className="badge badge-red rounded-pill" style={{ fontSize: '0.7rem' }}>{l.type}</span></td>
                        <td style={{ color: 'var(--red-400)', fontWeight: 600 }}>{fmt(l.amount)}</td>
                        <td>
                          <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', color: 'var(--red-400)' }}
                            onClick={() => handleDeleteLiability(l._id)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--navy-700)' }}>
                      <td colSpan={2} style={{ fontWeight: 600 }}>Total</td>
                      <td style={{ color: 'var(--red-400)', fontWeight: 700 }}>{fmt(totalLiabilities)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="modal show d-block modal-dark" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Asset</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowAssetModal(false)} />
              </div>
              <form onSubmit={handleAddAsset}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Asset Name</label>
                    <input type="text" className="form-control form-control-dark" placeholder="e.g. SBI Savings Account"
                      value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Type</label>
                    <select className="form-select form-select-dark" value={assetForm.type} onChange={e => setAssetForm({ ...assetForm, type: e.target.value })}>
                      {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Current Value (₹)</label>
                    <input type="number" className="form-control form-control-dark" placeholder="e.g. 250000"
                      value={assetForm.value} onChange={e => setAssetForm({ ...assetForm, value: e.target.value })} required min="0" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--navy-500)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => setShowAssetModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-cyan btn-sm" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Liability Modal */}
      {showLiabilityModal && (
        <div className="modal show d-block modal-dark" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Liability</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowLiabilityModal(false)} />
              </div>
              <form onSubmit={handleAddLiability}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Liability Name</label>
                    <input type="text" className="form-control form-control-dark" placeholder="e.g. SBI Home Loan"
                      value={liabilityForm.name} onChange={e => setLiabilityForm({ ...liabilityForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Type</label>
                    <select className="form-select form-select-dark" value={liabilityForm.type} onChange={e => setLiabilityForm({ ...liabilityForm, type: e.target.value })}>
                      {LIABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Outstanding Amount (₹)</label>
                    <input type="number" className="form-control form-control-dark" placeholder="e.g. 500000"
                      value={liabilityForm.amount} onChange={e => setLiabilityForm({ ...liabilityForm, amount: e.target.value })} required min="0" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--navy-500)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => setShowLiabilityModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-cyan btn-sm" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Liability'}
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
