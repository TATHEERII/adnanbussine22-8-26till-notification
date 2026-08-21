import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import './Layout.css'

const bottomNavItems = [
  { path: '/dashboard', label: 'Home', icon: '📊' },
  { path: '/purchase', label: 'Purchase', icon: '🛒' },
  { path: '/sales', label: 'Sales', icon: '💰' },
  { path: '/expenses', label: 'Expenses', icon: '🧾' },
  { path: '/more', label: 'More', icon: '⋯' },
]

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

export default function Layout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const location = useLocation()
  const navigate = useNavigate()

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((v) => !v)
    } else {
      setSidebarCollapsed((v) => !v)
    }
  }

  const handleBottomNavClick = (item) => {
    if (item.path === '/more') {
      setSidebarOpen(true)
    } else {
      navigate(item.path)
    }
  }

  return (
    <div className="layout">
      <Sidebar
        user={user}
        onClose={() => { setSidebarOpen(false); setActiveNav(null) }}
        sidebarOpen={sidebarOpen}
        collapsed={!isMobile && sidebarCollapsed}
        onLogout={onLogout}
      />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => { setSidebarOpen(false); setActiveNav(null) }} />
      )}
      <div className={`layout-main ${!isMobile && sidebarCollapsed ? 'layout-main-collapsed' : ''}`}>
        <Header
          user={user}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={!isMobile && sidebarCollapsed}
        />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
      {isMobile && (
        <BottomNav
          items={bottomNavItems}
          activePath={location.pathname}
          onNavClick={handleBottomNavClick}
        />
      )}
    </div>
  )
}
