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
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { DataProvider } from './context/DataContext'
import { getCurrentUser } from './services/auth'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('importbiz_token')
      if (token) {
        try {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        } catch {
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const handleLogin = (loggedInUser) => setUser(loggedInUser)
  const handleLogout = async () => {
    try {
      const { logout } = await import('./services/auth.js')
      await logout()
    } catch {
      // ignore logout errors
    }
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <SettingsProvider>
      <DataProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
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
      </DataProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}
