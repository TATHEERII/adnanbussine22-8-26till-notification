import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Reports() {
  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and view business reports.</p>
      </div>
      <div className="reports-grid">
        <Card title="Sales Report" subtitle="Approved sales">
          <div className="empty-state">No sales data available yet.</div>
          <div className="report-actions"><Button variant="secondary" size="sm">Print</Button></div>
        </Card>
        <Card title="Purchase Report" subtitle="Approved purchases">
          <div className="empty-state">No purchase data available yet.</div>
          <div className="report-actions"><Button variant="secondary" size="sm">Print</Button></div>
        </Card>
        <Card title="Expense Report" subtitle="Approved expenses">
          <div className="empty-state">No expense data available yet.</div>
          <div className="report-actions"><Button variant="secondary" size="sm">Print</Button></div>
        </Card>
        <Card title="Payment Report" subtitle="Approved payments">
          <div className="empty-state">No payment data available yet.</div>
          <div className="report-actions"><Button variant="secondary" size="sm">Print</Button></div>
        </Card>
        <Card title="Profit/Loss Report" subtitle="Sales - Purchases - Expenses">
          <div className="empty-state">No data available yet.</div>
          <div className="report-actions"><Button variant="secondary" size="sm">Print</Button></div>
        </Card>
        <Card title="Register Summary" subtitle="Overview by register">
          <div className="empty-state">No register data available yet.</div>
          <div className="report-actions"><Button variant="secondary" size="sm">Print</Button></div>
        </Card>
      </div>
    </div>
  )
}
