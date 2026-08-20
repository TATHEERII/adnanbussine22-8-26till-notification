import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import './Sidebar.css'

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['user'] },
  { path: '/registers', label: 'Registers', icon: '📒', roles: ['user'] },
  { path: '/purchase', label: 'Purchase', icon: '🛒', roles: ['user'] },
  { path: '/sales', label: 'Sales', icon: '💰', roles: ['user'] },
  { path: '/expenses', label: 'Expenses', icon: '🧾', roles: ['user'] },
  { path: '/payments', label: 'Payments', icon: '💳', roles: ['user'] },
  { path: '/account-ledger', label: 'Account Ledger', icon: '📋', roles: ['user'] },
  { path: '/approvals', label: 'Approvals', icon: '✅', roles: ['user'] },
  { path: '/reports', label: 'Reports', icon: '📈', roles: ['user'] },
  { path: '/audit-log', label: 'Audit Log', icon: '🕒', roles: ['user'] },
  { path: '/admin', label: 'Admin / Users', icon: '👥', roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
]

export default function Sidebar({ user, onClose, sidebarOpen, collapsed, onLogout }) {
  const location = useLocation()
  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role || 'user'))

  useEffect(() => {
    onClose?.()
  }, [location.pathname])

  const handleLogout = () => {
    onLogout?.()
  }

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">📦</div>
        <div className="sidebar-title">
          <span className="sidebar-title-main">ImportBiz</span>
          <span className="sidebar-title-sub">Accounting</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <span className="sidebar-logout-icon"><LogOut size={18} strokeWidth={2} /></span>
          <span className="sidebar-logout-label">Logout</span>
        </button>
        <p className="sidebar-copyright">© 2026 ImportBiz</p>
      </div>
    </aside>
  )
}
