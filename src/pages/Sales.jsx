import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Sales() {
  return (
    <div className="sales-page">
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
        <p className="page-subtitle">Record sales transactions.</p>
      </div>
      <Card title="Sales History" subtitle="All sales records" actions={<Button>+ New Sale</Button>}>
        <div className="empty-state">No sales found. Create your first sale record.</div>
      </Card>
    </div>
  )
}
