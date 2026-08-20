import './FAB.css'

export default function FAB({ onClick, label = '+' }) {
  return (
    <button
      type="button"
      className="fab"
      onClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  )
}
