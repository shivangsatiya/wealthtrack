import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { useAuth, API } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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
      {
        label: 'Income',
        data: monthlyData.map(m => m.income),
        borderColor: '#00c6d7', backgroundColor: 'rgba(0,198,215,0.08)',
        tension: 0.4, fill: true, pointRadius: 4, pointHoverRadius: 6
      },
      {
        label: 'Expenses',
        data: monthlyData.map(m => m.expense),
        borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)',
        tension: 0.4, fill: true, pointRadius: 4, pointHoverRadius: 6
      }
    ]
  }

  const doughnutData = {
    labels: breakdown.slice(0,6).map(b => b._id),
    datasets: [{
      data: breakdown.slice(0,6).map(b => b.total),
      backgroundColor: ['#00c6d7','#10b981','#f59e0b','#8b5cf6','#ef4444','#f97316'],
      borderColor: '#111827', borderWidth: 2
    }]
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12 } } },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(0,198,215,0.06)' } },
      y: { ticks: { color: '#64748b', font: { size: 11 }, callback: v => `₹${(v/1000).toFixed(0)}k` }, grid: { color: 'rgba(0,198,215,0.06)' } }
    }
  }

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 10, padding: 10 } } },
    cutout: '68%'
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="spinner-border spinner-cyan" />
    </div>
  )

  const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Income', value: fmt(totalIncome), icon: 'bi-arrow-down-circle-fill', color: 'var(--cyan-500)', sub: `${new Date().getFullYear()} YTD` },
          { label: 'Total Expenses', value: fmt(totalExpense), icon: 'bi-arrow-up-circle-fill', color: 'var(--red-400)', sub: `${new Date().getFullYear()} YTD` },
          { label: 'Net Savings', value: fmt(netSavings), icon: 'bi-piggy-bank-fill', color: 'var(--green-400)', sub: netSavings >= 0 ? 'Surplus' : 'Deficit' },
          { label: 'Habits Today', value: `${habitsDoneToday}/${habits.length}`, icon: 'bi-lightning-charge-fill', color: 'var(--amber-400)', sub: 'completed' },
        ].map((card, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div className="stat-card h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
                <i className={`bi ${card.icon}`} style={{ color: card.color, fontSize: '1.2rem' }}></i>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card-dark p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Income vs Expenses</h6>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date().getFullYear()}</span>
            </div>
            <div className="chart-container">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card-dark p-3 h-100">
            <h6 className="mb-3" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Expense Breakdown</h6>
            {breakdown.length > 0 ? (
              <div className="chart-container"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100" style={{ color: 'var(--text-muted)' }}>
                <div className="text-center"><i className="bi bi-pie-chart" style={{ fontSize: '2rem' }}></i><br />No data yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="row g-3">
        {/* Recent transactions */}
        <div className="col-lg-6">
          <div className="card-dark p-3">
            <h6 className="mb-3" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Recent Transactions</h6>
            {recentTx.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
            ) : recentTx.map(tx => (
              <div key={tx._id} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{tx.category}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.description || '—'} · {new Date(tx.date).toLocaleDateString('en-IN')}</div>
                </div>
                <span style={{ fontWeight: 600, color: tx.type === 'income' ? 'var(--green-400)' : 'var(--red-400)', fontSize: '0.9rem' }}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals summary */}
        <div className="col-lg-6">
          <div className="card-dark p-3">
            <h6 className="mb-3" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Savings Goals</h6>
            {goals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No goals set yet</p>
            ) : goals.slice(0, 4).map(goal => {
              const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
              return (
                <div key={goal._id} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: '0.875rem' }}>{goal.icon} {goal.title}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cyan-500)' }}>{pct}%</span>
                  </div>
                  <div className="progress-dark">
                    <div className="progress-bar-cyan" style={{ width: `${pct}%`, height: '100%', borderRadius: 999, transition: 'width 0.5s' }} />
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmt(goal.savedAmount)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmt(goal.targetAmount)}</span>
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
