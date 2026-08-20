import { useLocation } from 'react-router-dom'
import './Header.css'
import ApprovalBell from './ApprovalBell'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/registers': 'Registers / Ledgers',
  '/purchase': 'Purchase',
  '/sales': 'Sales',
  '/expenses': 'Expenses',
  '/payments': 'Payments',
  '/account-ledger': 'Account Ledger',
  '/approvals': 'Approvals',
  '/reports': 'Reports',
  '/audit-log': 'Audit Log',
  '/admin': 'Admin / Users',
  '/settings': 'Settings',
}

export default function Header({ user, onToggleSidebar, sidebarOpen, sidebarCollapsed }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          {sidebarOpen ? '✕' : sidebarCollapsed ? '☰' : '☰'}
        </button>
        <h1 className="header-page-title">{title}</h1>
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="header-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.name || 'User'}</span>
            <span className="header-user-role">{user?.role === 'admin' ? 'Admin' : 'User'}</span>
          </div>
        </div>
        <ApprovalBell user={user} />
      </div>
    </header>
  )
}
