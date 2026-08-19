import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Payments() {
  return (
    <div className="payments-page">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Record payment transactions.</p>
      </div>
      <Card title="Payment History" subtitle="All payment records" actions={<Button>+ New Payment</Button>}>
        <div className="empty-state">No payments found. Create your first payment record.</div>
      </Card>
    </div>
  )
}
