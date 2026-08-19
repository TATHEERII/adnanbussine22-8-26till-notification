import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function AccountLedger() {
  return (
    <div className="ledger-page">
      <div className="page-header">
        <h1 className="page-title">Account Ledger</h1>
        <p className="page-subtitle">View approved transactions by register.</p>
      </div>
      <Card title="Ledger" subtitle="Approved transactions only">
        <div className="empty-state">No ledger entries yet. Approved transactions will appear here.</div>
      </Card>
    </div>
  )
}
