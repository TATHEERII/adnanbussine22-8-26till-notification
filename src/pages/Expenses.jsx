import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Expenses() {
  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">Track business expenses.</p>
      </div>
      <Card title="Expense History" subtitle="All expense records" actions={<Button>+ New Expense</Button>}>
        <div className="empty-state">No expenses found. Create your first expense record.</div>
      </Card>
    </div>
  )
}
