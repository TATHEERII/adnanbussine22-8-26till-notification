import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Purchase() {
  return (
    <div className="purchase-page">
      <div className="page-header">
        <h1 className="page-title">Purchase</h1>
        <p className="page-subtitle">Record purchase transactions.</p>
      </div>
      <Card title="Purchase History" subtitle="All purchase records" actions={<Button>+ New Purchase</Button>}>
        <div className="empty-state">No purchases found. Create your first purchase record.</div>
      </Card>
    </div>
  )
}
