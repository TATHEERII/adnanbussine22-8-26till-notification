import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

export default function AuditLog() {
  return (
    <div className="audit-page">
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Track all important system actions.</p>
      </div>
      <Card title="Audit Log" subtitle="Recent system activities">
        <div className="empty-state">No audit logs yet. Actions will be recorded here as they occur.</div>
      </Card>
    </div>
  )
}
