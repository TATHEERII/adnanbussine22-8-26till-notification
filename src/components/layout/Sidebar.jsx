import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/registers', label: 'Registers', icon: '📒' },
  { path: '/purchase', label: 'Purchase', icon: '🛒' },
  { path: '/sales', label: 'Sales', icon: '💰' },
  { path: '/expenses', label: 'Expenses', icon: '🧾' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/account-ledger', label: 'Account Ledger', icon: '📋' },
  { path: '/approvals', label: 'Approvals', icon: '✅' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/audit-log', label: 'Audit Log', icon: '🕒' },
  { path: '/admin', label: 'Admin / Users', icon: '👥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
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
        <p className="sidebar-copyright">© 2026 ImportBiz</p>
      </div>
    </aside>
  )
}
