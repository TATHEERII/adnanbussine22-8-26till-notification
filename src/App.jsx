import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Registers from './pages/Registers'
import Purchase from './pages/Purchase'
import Sales from './pages/Sales'
import Expenses from './pages/Expenses'
import Payments from './pages/Payments'
import AccountLedger from './pages/AccountLedger'
import Approvals from './pages/Approvals'
import Reports from './pages/Reports'
import AuditLog from './pages/AuditLog'
import AdminUsers from './pages/AdminUsers'
import Settings from './pages/Settings'
import { useState, useEffect } from 'react'
import { currentUser, mockUsers } from './data/mockData'

const STORAGE_KEY = 'importbiz_auth_user'

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return mockUsers.find((u) => u.id === parsed.id) || null
  } catch {
    return null
  }
}

function ProtectedRoute({ user, onLogout }) {
  if (!user) return <Navigate to="/login" replace />
  return <Layout user={user} onLogout={onLogout} />
}

export default function App() {
  const [user, setUser] = useState(getStoredUser)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const handleLogin = (loggedInUser) => setUser(loggedInUser || currentUser)
  const handleLogout = () => setUser(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={<ProtectedRoute user={user} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="registers" element={<Registers />} />
          <Route path="purchase" element={<Purchase />} />
          <Route path="sales" element={<Sales />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="payments" element={<Payments />} />
          <Route path="account-ledger" element={<AccountLedger />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="admin" element={<AdminUsers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
