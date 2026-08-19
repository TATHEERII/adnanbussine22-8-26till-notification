import { useNavigate, useLocation } from 'react-router-dom'
import './Header.css'

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

export default function Header({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  const handleLogout = () => {
    onLogout?.()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
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
        <button className="header-logout" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </header>
  )
}
