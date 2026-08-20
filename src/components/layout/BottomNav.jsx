import { NavLink } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav({ items, activePath, onNavClick }) {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const isActive = item.path !== '/more' && activePath === item.path
        return (
          <button
            key={item.path}
            type="button"
            className={`bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`}
            onClick={() => onNavClick(item)}
            aria-label={item.label}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
