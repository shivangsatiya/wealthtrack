import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { useAuth, API } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (!target) return
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return count
}

// FIXED: replaced Tailwind classes with inline styles
function StatCard({ label, value, color, icon, sub, habits }) {
  const count = useCountUp(value || 0)
  const [hovered, setHovered] = useState(false)

  return (
    <div className="col-6 col-lg-3">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--color-bg-card)',
          border: `1px solid ${hovered ? color : 'var(--color-border)'}`,
          borderRadius: '0.75rem', padding: '1.25rem',
          transition: 'all 0.3s',
          boxShadow: hovered ? `0 0 20px ${color}20` : 'none',
          cursor: 'default', height: '100%'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          <i className={`bi ${icon}`} style={{ color, fontSize: '1.2rem', transform: hovered ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s' }}></i>
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color, transition: 'all 0.3s', textShadow: hovered ? `0 0 16px ${color}50` : 'none' }}>
          {habits ? habits : `₹${count.toLocaleString('en-IN')}`}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    Promise.all([
      axios.get(`${API}/transactions/summary?year=${year}`),
      axios.get(`${API}/transactions/category-breakdown?month=${month}&year=${year}`),
      axios.get(`${API}/habits`),
      axios.get(`${API}/goals`),
      axios.get(`${API}/transactions?limit=5`)
    ]).then(([s, b, h, g, tx]) => {
      setSummary(s.data); setBreakdown(b.data)
      setHabits(h.data); setGoals(g.data); setRecentTx(tx.data)
    }).finally(() => setLoading(false))
  }, [])

  const monthlyData = MONTHS.map((_, i) => {
    const inc = summary.find(s => s._id.month === i+1 && s._id.type === 'income')?.total || 0
    const exp = summary.find(s => s._id.month === i+1 && s._id.type === 'expense')?.total || 0
    return { income: inc, expense: exp }
  })

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0)
  const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0)
  const netSavings = totalIncome - totalExpense
  const habitsDoneToday = habits.filter(h => {
    const today = new Date(); today.setHours(0,0,0,0)
    return h.completions?.some(c => {
      const d = new Date(c.date); d.setHours(0,0,0,0)
      return d.getTime() === today.getTime()
    })
  }).length

  const lineData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: monthlyData.map(m => m.income), borderColor: 'var(--color-primary)', backgroundColor: 'rgba(6,182,212,0.12)', tension: 0.4, fill: true, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 },
      { label: 'Expenses', data: monthlyData.map(m => m.expense), borderColor: 'var(--color-danger)', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 }
    ]
  }

  // FIXED: replaced undefined CSS vars with real hex values
  const doughnutData = {
    labels: breakdown.slice(0,6).map(b => b._id),
    datasets: [{
      data: breakdown.slice(0,6).map(b => b.total),
      backgroundColor: ['#06b6d4','#10b981','#f59e0b','#8b5cf6','#ef4444','#f97316'],
      borderColor: 'var(--color-bg-secondary)', borderWidth: 2
    }]
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12 } } },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: 'var(--color-text-muted)', font: { size: 11 }, callback: v => `₹${(v/1000).toFixed(0)}k` }, grid: { color: 'rgba(255,255,255,0.08)' } }
    }
  }

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: 'var(--color-text-muted)', font: { size: 11 }, boxWidth: 10, padding: 10 } } },
    cutout: '68%'
  }

  // FIXED: replaced Tailwind spinner with Bootstrap spinner
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner-border" style={{ color: 'var(--color-primary)' }} />
    </div>
  )

  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Here's your financial overview</p>
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat cards - FIXED: Bootstrap grid instead of Tailwind */}
      <div className="row g-3 mb-4">
        <StatCard label="Total Income" value={totalIncome} color="var(--color-primary)" icon="bi-arrow-down-circle-fill" sub={`${new Date().getFullYear()} YTD`} />
        <StatCard label="Total Expenses" value={totalExpense} color="var(--color-danger)" icon="bi-arrow-up-circle-fill" sub={`${new Date().getFullYear()} YTD`} />
        <StatCard label="Net Savings" value={Math.abs(netSavings)} color={netSavings >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)'} icon="bi-piggy-bank-fill" sub={netSavings >= 0 ? 'Surplus' : 'Deficit'} />
        <StatCard label="Habits Today" value={null} color="var(--color-accent)" icon="bi-lightning-charge-fill" sub="completed" habits={`${habitsDoneToday}/${habits.length}`} />
      </div>

      {/* Charts - FIXED: Bootstrap grid, restored Doughnut component */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="hover-card" style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h6 style={{ fontWeight: 600, margin: 0 }}>Income vs Expenses</h6>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date().getFullYear()}</span>
            </div>
            <div style={{ height: 260 }}><Line data={lineData} options={chartOptions} /></div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="hover-card" style={{ ...cardStyle, height: '100%' }}>
            <h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Expense Breakdown</h6>
            {/* FIXED: was empty div, now renders actual Doughnut chart */}
            {breakdown.length > 0 ? (
              <div style={{ height: 260 }}><Doughnut data={doughnutData} options={doughnutOptions} /></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: 'var(--color-text-muted)', flexDirection: 'column', gap: 8 }}>
                <i className="bi bi-pie-chart" style={{ fontSize: '2rem' }}></i>
                <span>No data yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="hover-card" style={cardStyle}>
            <h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Recent Transactions</h6>
            {recentTx.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No transactions yet</p>
            ) : recentTx.map(tx => (
              <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{tx.category}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{tx.description || '—'} · {new Date(tx.date).toLocaleDateString('en-IN')}</div>
                </div>
                <span style={{ fontWeight: 600, color: tx.type === 'income' ? 'var(--color-secondary)' : 'var(--color-danger)', fontSize: '0.9rem' }}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="hover-card" style={cardStyle}>
            <h6 style={{ fontWeight: 600, marginBottom: '1rem' }}>Savings Goals</h6>
            {goals.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No goals set yet</p>
            ) : goals.slice(0, 4).map(goal => {
              const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
              return (
                <div key={goal._id} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.875rem' }}>{goal.icon} {goal.title}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{pct}%</span>
                  </div>
                  <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 999, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{fmt(goal.savedAmount)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{fmt(goal.targetAmount)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const cardStyle = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '1.25rem' }
