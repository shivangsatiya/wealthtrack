import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { API } from '../context/AuthContext'
import useCountUp from '../hooks/useCountUp'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const ASSET_TYPES = ['Cash','Savings Account','Fixed Deposit','Stocks','Mutual Funds','Real Estate','Gold','Crypto','Other']
const LIABILITY_TYPES = ['Home Loan','Car Loan','Personal Loan','Credit Card','Education Loan','Other']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const cardStyle = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '1.25rem' }
const inputStyle = { width: '100%', padding: '0.7rem 0.9rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none' }
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.875rem', verticalAlign: 'middle' }
const thStyle = { padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }
const btnPrimary = { background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: '#0a0e1a', fontWeight: 600, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }
const btnSecondary = { background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.875rem', padding: '0.6rem 1.25rem', cursor: 'pointer' }
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }
const closeBtn = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }

// Animated, hoverable metric tile — mirrors the StatCard/SummaryCard pattern
// used on Dashboard and Expense Tracker (count-up number + lift-and-glow on hover).
function WealthMetric({ label, value, color, large }) {
  const count = useCountUp(Math.abs(value || 0))
  const [hovered, setHovered] = useState(false)
  const sign = value < 0 ? '-' : ''

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        borderRadius: '0.75rem',
        padding: '0.4rem 0.9rem',
        transition: 'box-shadow 0.3s, transform 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 0 26px ${color}30, 0 6px 22px rgba(0,0,0,0.3)` : 'none',
        cursor: 'default'
      }}
    >
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: large ? 8 : 4 }}>{label}</div>
      {large ? (
        <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--color-primary), #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'netWorthPulse 3s ease-in-out infinite' }}>
          {sign}₹{count.toLocaleString('en-IN')}
        </div>
      ) : (
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color, textShadow: hovered ? `0 0 16px ${color}50` : 'none', transition: 'text-shadow 0.3s' }}>
          {sign}₹{count.toLocaleString('en-IN')}
        </div>
      )}
    </div>
  )
}

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

  const snapshots = wealth?.netWorthSnapshots?.slice(-12) || []
  const netWorthChartData = {
    labels: snapshots.map((_, i) => `#${i + 1}`),
    datasets: [{ label: 'Net Worth', data: snapshots.map(s => s.netWorth || 0), borderColor: 'var(--color-primary)', backgroundColor: 'rgba(6,182,212,0.12)', tension: 0.4, fill: true, pointRadius: 4, borderWidth: 2 }]
  }

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: MONTHS.map((_, i) => { const entry = summary.find(s => s._id?.month === i+1 && s._id?.type === 'income'); return entry?.total || 0 }), backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6 },
      { label: 'Expenses', data: MONTHS.map((_, i) => { const entry = summary.find(s => s._id?.month === i+1 && s._id?.type === 'expense'); return entry?.total || 0 }), backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 6 }
    ]
  }

  const assetGrouped = {}
  wealth?.assets?.forEach(a => { assetGrouped[a.type] = (assetGrouped[a.type] || 0) + a.value })
  const assetDoughnut = {
    labels: Object.keys(assetGrouped),
    datasets: [{ data: Object.values(assetGrouped), backgroundColor: ['#06b6d4','#10b981','#f59e0b','#8b5cf6','#ef4444','#f97316','#ec4899','#6366f1','#64748b'], borderColor: 'var(--color-bg-secondary)', borderWidth: 2 }]
  }

  const chartOpts = () => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12 } } },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: 'var(--color-text-muted)', font: { size: 11 }, callback: v => `₹${(v/1000).toFixed(0)}k` }, grid: { color: 'rgba(255,255,255,0.08)' } }
    }
  })

  const doughnutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'var(--color-text-muted)', font: { size: 11 }, boxWidth: 10, padding: 8 } } }, cutout: '65%' }

  const handleAddAsset = async (e) => {
    e.preventDefault(); setSaving(true)
    try { const res = await axios.post(`${API}/wealth/asset`, { ...assetForm, value: Number(assetForm.value) }); setWealth(res.data); setShowAssetModal(false); setAssetForm({ name: '', type: 'Cash', value: '' }); showToast('Asset added!') }
    catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleAddLiability = async (e) => {
    e.preventDefault(); setSaving(true)
    try { const res = await axios.post(`${API}/wealth/liability`, { ...liabilityForm, amount: Number(liabilityForm.amount) }); setWealth(res.data); setShowLiabilityModal(false); setLiabilityForm({ name: '', type: 'Personal Loan', amount: '' }); showToast('Liability added!') }
    catch (err) { showToast(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDeleteAsset = async (id) => { const res = await axios.delete(`${API}/wealth/asset/${id}`); setWealth(res.data); showToast('Asset removed') }
  const handleDeleteLiability = async (id) => { const res = await axios.delete(`${API}/wealth/liability/${id}`); setWealth(res.data); showToast('Liability removed') }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner-border" style={{ color: 'var(--color-primary)' }} /></div>

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Wealth Analytics</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Track your net worth and financial growth</p>
      </div>

      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(6,182,212,0.06), var(--color-bg-card))', borderColor: 'rgba(6,182,212,0.2)', marginBottom: '1.5rem' }}>
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <WealthMetric label="Net Worth" value={netWorth} color="var(--color-primary)" large />
            <div style={{ color: netWorth >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)', fontSize: '0.85rem', marginTop: 6 }}>
              <i className={`bi bi-arrow-${netWorth >= 0 ? 'up' : 'down'}-circle me-1`}></i>
              {netWorth >= 0 ? 'Positive net worth' : 'Liabilities exceed assets'}
            </div>
          </div>
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <WealthMetric label="Total Assets" value={totalAssets} color="var(--color-secondary)" />
          </div>
          <div className="col-md-4 text-center">
            <WealthMetric label="Total Liabilities" value={totalLiabilities} color="var(--color-danger)" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {['overview','assets','liabilities'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 18px', borderRadius: 8, fontWeight: activeTab === tab ? 600 : 400, background: activeTab === tab ? 'rgba(6,182,212,0.12)' : 'var(--color-bg-secondary)', border: `1px solid ${activeTab === tab ? 'var(--color-primary)' : 'var(--color-border)'}`, color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="row g-3">
          <div className="col-lg-8"><div className="hover-card" style={cardStyle}><h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Monthly Income vs Expenses ({new Date().getFullYear()})</h6><div style={{ height: 280 }}><Bar data={barData} options={chartOpts()} /></div></div></div>
          <div className="col-lg-4"><div className="hover-card" style={cardStyle}><h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Asset Allocation</h6>{Object.keys(assetGrouped).length > 0 ? <div style={{ height: 280 }}><Doughnut data={assetDoughnut} options={doughnutOpts} /></div> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: 'var(--color-text-muted)', flexDirection: 'column', gap: 8 }}><i className="bi bi-pie-chart" style={{ fontSize: '2rem' }}></i><span>No assets yet</span></div>}</div></div>
          {snapshots.length > 1 && <div className="col-12"><div className="hover-card" style={cardStyle}><h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Net Worth History</h6><div style={{ height: 240 }}><Line data={netWorthChartData} options={chartOpts()} /></div></div></div>}
        </div>
      )}

      {activeTab === 'assets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h6 style={{ fontWeight: 600, margin: 0 }}>Assets ({wealth?.assets?.length || 0})</h6>
            <button onClick={() => setShowAssetModal(true)} style={btnPrimary}><i className="bi bi-plus-lg me-1"></i>Add Asset</button>
          </div>
          {(wealth?.assets?.length || 0) === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}><i className="bi bi-bank" style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)' }}></i><p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No assets added yet</p></div>
          ) : (
            <div style={cardStyle}><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--color-bg-secondary)' }}>{['Name','Type','Value',''].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {wealth.assets.map(a => (
                  <tr key={a._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}>{a.name}</td>
                    <td style={tdStyle}><span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(6,182,212,0.2)' }}>{a.type}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--color-secondary)' }}>{fmt(a.value)}</td>
                    <td style={tdStyle}><button onClick={() => handleDeleteAsset(a._id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><i className="bi bi-trash3"></i></button></td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--color-bg-secondary)', borderTop: '2px solid var(--color-border)' }}>
                  <td colSpan={2} style={{ ...tdStyle, fontWeight: 700 }}>Total Assets</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--color-secondary)', fontSize: '1rem' }}>{fmt(totalAssets)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table></div></div>
          )}
        </div>
      )}

      {activeTab === 'liabilities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h6 style={{ fontWeight: 600, margin: 0 }}>Liabilities ({wealth?.liabilities?.length || 0})</h6>
            <button onClick={() => setShowLiabilityModal(true)} style={btnPrimary}><i className="bi bi-plus-lg me-1"></i>Add Liability</button>
          </div>
          {(wealth?.liabilities?.length || 0) === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}><i className="bi bi-credit-card" style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)' }}></i><p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No liabilities added yet</p></div>
          ) : (
            <div style={cardStyle}><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--color-bg-secondary)' }}>{['Name','Type','Amount',''].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {wealth.liabilities.map(l => (
                  <tr key={l._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}>{l.name}</td>
                    <td style={tdStyle}><span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>{l.type}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--color-danger)' }}>{fmt(l.amount)}</td>
                    <td style={tdStyle}><button onClick={() => handleDeleteLiability(l._id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><i className="bi bi-trash3"></i></button></td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--color-bg-secondary)', borderTop: '2px solid var(--color-border)' }}>
                  <td colSpan={2} style={{ ...tdStyle, fontWeight: 700 }}>Total Liabilities</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--color-danger)', fontSize: '1rem' }}>{fmt(totalLiabilities)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table></div></div>
          )}
        </div>
      )}

      {showAssetModal && (
        <div style={modalOverlay}><div style={{ ...cardStyle, width: '100%', maxWidth: 480 }}>
          <div style={modalHeader}><h5 style={{ fontWeight: 700, margin: 0 }}>Add Asset</h5><button onClick={() => setShowAssetModal(false)} style={closeBtn}><i className="bi bi-x-lg"></i></button></div>
          <form onSubmit={handleAddAsset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={labelStyle}>Asset Name</label><input type="text" style={inputStyle} placeholder="e.g. SBI Savings Account" value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} required /></div>
            <div><label style={labelStyle}>Type</label><select style={inputStyle} value={assetForm.type} onChange={e => setAssetForm({ ...assetForm, type: e.target.value })}>{ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={labelStyle}>Current Value (₹)</label><input type="number" style={inputStyle} placeholder="e.g. 250000" value={assetForm.value} onChange={e => setAssetForm({ ...assetForm, value: e.target.value })} required min="0" /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button type="button" onClick={() => setShowAssetModal(false)} style={btnSecondary}>Cancel</button><button type="submit" disabled={saving} style={btnPrimary}>{saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Asset'}</button></div>
          </form>
        </div></div>
      )}

      {showLiabilityModal && (
        <div style={modalOverlay}><div style={{ ...cardStyle, width: '100%', maxWidth: 480 }}>
          <div style={modalHeader}><h5 style={{ fontWeight: 700, margin: 0 }}>Add Liability</h5><button onClick={() => setShowLiabilityModal(false)} style={closeBtn}><i className="bi bi-x-lg"></i></button></div>
          <form onSubmit={handleAddLiability} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={labelStyle}>Liability Name</label><input type="text" style={inputStyle} placeholder="e.g. SBI Home Loan" value={liabilityForm.name} onChange={e => setLiabilityForm({ ...liabilityForm, name: e.target.value })} required /></div>
            <div><label style={labelStyle}>Type</label><select style={inputStyle} value={liabilityForm.type} onChange={e => setLiabilityForm({ ...liabilityForm, type: e.target.value })}>{LIABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={labelStyle}>Outstanding Amount (₹)</label><input type="number" style={inputStyle} placeholder="e.g. 500000" value={liabilityForm.amount} onChange={e => setLiabilityForm({ ...liabilityForm, amount: e.target.value })} required min="0" /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button type="button" onClick={() => setShowLiabilityModal(false)} style={btnSecondary}>Cancel</button><button type="submit" disabled={saving} style={btnPrimary}>{saving ? <span className="spinner-border spinner-border-sm" /> : 'Add Liability'}</button></div>
          </form>
        </div></div>
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
