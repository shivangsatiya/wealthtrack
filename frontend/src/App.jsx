import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ExpenseTracker from './pages/ExpenseTracker'
import HabitTracker from './pages/HabitTracker'
import SavingsGoals from './pages/SavingsGoals'
import WealthAnalytics from './pages/WealthAnalytics'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import Feedback from './pages/Feedback'

function ProtectedRoute({ children, adminRequired = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner-border" style={{ color: 'var(--color-primary)' }} role="status" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminRequired && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><AppLayout><ExpenseTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/habits" element={<ProtectedRoute><AppLayout><HabitTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><AppLayout><SavingsGoals /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><WealthAnalytics /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><AppLayout><Feedback /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminRequired><AppLayout><AdminPanel /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
