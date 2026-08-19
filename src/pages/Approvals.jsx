import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function Approvals() {
  return (
    <div className="approvals-page">
      <div className="page-header">
        <h1 className="page-title">Approvals</h1>
        <p className="page-subtitle">Review and approve pending requests.</p>
      </div>
      <div className="approvals-sections">
        <Card title="Register Approvals" subtitle="Pending register requests" actions={<Button variant="secondary" size="sm">View All</Button>}>
          <div className="empty-state">No pending register approvals.</div>
        </Card>
        <Card title="Purchase Approvals" subtitle="Pending purchase requests" actions={<Button variant="secondary" size="sm">View All</Button>}>
          <div className="empty-state">No pending purchase approvals.</div>
        </Card>
        <Card title="Sales Approvals" subtitle="Pending sale requests" actions={<Button variant="secondary" size="sm">View All</Button>}>
          <div className="empty-state">No pending sales approvals.</div>
        </Card>
        <Card title="Expense Approvals" subtitle="Pending expense requests" actions={<Button variant="secondary" size="sm">View All</Button>}>
          <div className="empty-state">No pending expense approvals.</div>
        </Card>
        <Card title="Payment Approvals" subtitle="Pending payment requests" actions={<Button variant="secondary" size="sm">View All</Button>}>
          <div className="empty-state">No pending payment approvals.</div>
        </Card>
      </div>
    </div>
  )
}
