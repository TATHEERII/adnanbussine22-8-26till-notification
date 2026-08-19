import './FormLayout.css'

export default function FormLayout({ title, subtitle, children, onSubmit }) {
  return (
    <div className="form-layout">
      <div className="form-layout-header">
        <div>
          <h2 className="form-layout-title">{title}</h2>
          {subtitle && <p className="form-layout-subtitle">{subtitle}</p>}
        </div>
      </div>
      <form onSubmit={onSubmit} className="form-layout-body">
        {children}
      </form>
    </div>
  )
}

export function FormSection({ title, children }) {
  return (
    <div className="form-section">
      {title && <h4 className="form-section-title">{title}</h4>}
      <div className="form-section-grid">{children}</div>
    </div>
  )
}
