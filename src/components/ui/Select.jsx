import './Select.css'

export default function Select({ label, options = [], placeholder, error, className = '', ...props }) {
  return (
    <div className={`select-group ${className}`}>
      {label && <label className="select-label">{label}</label>}
      <div className="select-wrapper">
        <select className={`select ${error ? 'select-error' : ''}`} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
      </div>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  )
}
