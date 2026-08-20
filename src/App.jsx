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
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'

const STORAGE_KEY = 'importbiz_v2_auth_user'

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

function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function UserRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/settings" replace />
  return children
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
      <SettingsProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={<ProtectedRoute user={user} onLogout={handleLogout} />}>
          <Route path="dashboard" element={
            <UserRoute user={user}><Dashboard /></UserRoute>
          } />
          <Route path="registers" element={
            <UserRoute user={user}><Registers /></UserRoute>
          } />
          <Route path="purchase" element={
            <UserRoute user={user}><Purchase /></UserRoute>
          } />
          <Route path="sales" element={
            <UserRoute user={user}><Sales /></UserRoute>
          } />
          <Route path="expenses" element={
            <UserRoute user={user}><Expenses /></UserRoute>
          } />
          <Route path="payments" element={
            <UserRoute user={user}><Payments /></UserRoute>
          } />
          <Route path="account-ledger" element={
            <UserRoute user={user}><AccountLedger /></UserRoute>
          } />
          <Route path="approvals" element={
            <UserRoute user={user}><Approvals /></UserRoute>
          } />
          <Route path="reports" element={
            <UserRoute user={user}><Reports /></UserRoute>
          } />
          <Route path="audit-log" element={
            <UserRoute user={user}><AuditLog /></UserRoute>
          } />
          <Route path="admin" element={
            <AdminRoute user={user}><AdminUsers /></AdminRoute>
          } />
          <Route path="settings" element={
            <AdminRoute user={user}><Settings /></AdminRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </SettingsProvider>
    </BrowserRouter>
  )
}
