import './Button.css'

export default function Button({ children, variant = 'primary', size = 'md', disabled, loading, className = '', ...props }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled || loading ? 'btn-disabled' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  )
}
