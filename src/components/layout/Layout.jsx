import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { AuthProvider } from '../../context/AuthContext'
import './Layout.css'

export default function Layout({ user, onLogout }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header user={user} onLogout={onLogout} />
        <main className="layout-content">
          <AuthProvider user={user}>
            <Outlet />
          </AuthProvider>
        </main>
      </div>
    </div>
  )
}
