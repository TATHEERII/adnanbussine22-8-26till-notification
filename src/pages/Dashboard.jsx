import { useState, useMemo } from 'react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import { mockTransactions, mockRegisters, mockApprovals } from '../data/mockData'
import './Dashboard.css'

const toLocalDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = new Date()
const todayStr = toLocalDate(today)

const getWeekRange = () => {
  const start = new Date(today)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    start: toLocalDate(start),
    end: toLocalDate(end),
  }
}

const getMonthRange = () => {
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return {
    start: toLocalDate(start),
    end: toLocalDate(end),
  }
}

const weekRange = getWeekRange()
const monthRange = getMonthRange()

const formatCurrency = (amount) => {
  const num = Number(amount) || 0
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const statusVariant = (status) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'default'
  }
}

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState('month')
  const [customStart, setCustomStart] = useState(todayStr)
  const [customEnd, setCustomEnd] = useState(todayStr)

  const isInRange = (dateStr) => {
    if (dateFilter === 'today') return dateStr === todayStr
    if (dateFilter === 'week') return dateStr >= weekRange.start && dateStr <= weekRange.end
    if (dateFilter === 'month') return dateStr >= monthRange.start && dateStr <= monthRange.end
    if (dateFilter === 'custom') return dateStr >= customStart && dateStr <= customEnd
    return true
  }

  const approvedInRange = useMemo(() => mockTransactions.filter((t) => t.status === 'approved' && isInRange(t.date)), [dateFilter, customStart, customEnd])
  const allInRange = useMemo(() => mockTransactions.filter((t) => isInRange(t.date)).sort((a, b) => b.date.localeCompare(a.date)), [dateFilter, customStart, customEnd])

  const totalSales = useMemo(() => approvedInRange.filter((t) => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0), [approvedInRange])
  const totalPurchases = useMemo(() => approvedInRange.filter((t) => t.type === 'Purchase').reduce((sum, t) => sum + t.amount, 0), [approvedInRange])
  const totalExpenses = useMemo(() => approvedInRange.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0), [approvedInRange])
  const totalPayments = useMemo(() => approvedInRange.filter((t) => t.type === 'Payment').reduce((sum, t) => sum + t.amount, 0), [approvedInRange])
  const netProfitLoss = totalSales - totalPurchases - totalExpenses
  const activeRegisters = mockRegisters.filter((r) => r.status === 'active').length
  const pendingApprovals = mockApprovals.filter((a) => a.status === 'pending').length

  const profitLossClass = netProfitLoss > 0 ? 'text-success' : netProfitLoss < 0 ? 'text-danger' : 'text-muted'
  const profitLossLabel = netProfitLoss > 0 ? 'Profit' : netProfitLoss < 0 ? 'Loss' : 'Break-even'

  const transactionColumns = [
    { key: 'date', label: 'Date' },
    { key: 'register', label: 'Register' },
    { key: 'type', label: 'Type', render: (val) => <Badge variant={val === 'Sale' ? 'success' : val === 'Purchase' ? 'warning' : val === 'Expense' ? 'danger' : 'info'}>{val}</Badge> },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: (val) => <span className="table-amount">{formatCurrency(val)}</span> },
    { key: 'createdBy', label: 'Created By' },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={statusVariant(val)}>{val}</Badge> },
  ]

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back. Here is your business overview.</p>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <button className={`filter-btn ${dateFilter === 'today' ? 'filter-btn-active' : ''}`} onClick={() => setDateFilter('today')}>Today</button>
          <button className={`filter-btn ${dateFilter === 'week' ? 'filter-btn-active' : ''}`} onClick={() => setDateFilter('week')}>This Week</button>
          <button className={`filter-btn ${dateFilter === 'month' ? 'filter-btn-active' : ''}`} onClick={() => setDateFilter('month')}>This Month</button>
          <button className={`filter-btn ${dateFilter === 'custom' ? 'filter-btn-active' : ''}`} onClick={() => setDateFilter('custom')}>Custom Range</button>
        </div>
        {dateFilter === 'custom' && (
          <div className="filter-dates">
            <input type="date" className="filter-date-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <span className="filter-date-sep">to</span>
            <input type="date" className="filter-date-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        )}
      </div>

      <div className="stats-grid">
        <Card title="Active Registers" subtitle="Currently active" className="stat-card">
          <div className="stat-value">{activeRegisters}</div>
        </Card>
        <Card title="Total Sales" subtitle="Approved sales" className="stat-card">
          <div className="stat-value">{formatCurrency(totalSales)}</div>
        </Card>
        <Card title="Total Purchases" subtitle="Approved purchases" className="stat-card">
          <div className="stat-value">{formatCurrency(totalPurchases)}</div>
        </Card>
        <Card title="Total Expenses" subtitle="Approved expenses" className="stat-card">
          <div className="stat-value">{formatCurrency(totalExpenses)}</div>
        </Card>
        <Card title="Total Payments" subtitle="Approved payments" className="stat-card">
          <div className="stat-value">{formatCurrency(totalPayments)}</div>
        </Card>
        <Card title={`Net Profit/Loss (${profitLossLabel})`} subtitle="Sales - Purchases - Expenses" className={`stat-card ${profitLossClass}`}>
          <div className={`stat-value ${profitLossClass}`}>{formatCurrency(netProfitLoss)}</div>
        </Card>
        <Card title="Pending Approvals" subtitle="Awaiting review" className="stat-card">
          <div className="stat-value">{pendingApprovals}</div>
        </Card>
      </div>

      <Card title="Recent Transactions" subtitle={`Showing ${allInRange.length} transaction(s)`} className="mt-6">
        <Table columns={transactionColumns} data={allInRange} emptyText="No transactions found for the selected period." />
      </Card>

      <Card title="Profit / Loss Summary" subtitle="Financial breakdown for selected period" className="mt-6">
        <div className="pl-grid">
          <div className="pl-row">
            <span className="pl-label">Total Approved Sales</span>
            <span className="pl-value pl-sales">{formatCurrency(totalSales)}</span>
          </div>
          <div className="pl-row">
            <span className="pl-label">Total Approved Purchases</span>
            <span className="pl-value pl-purchases">{formatCurrency(totalPurchases)}</span>
          </div>
          <div className="pl-row">
            <span className="pl-label">Total Approved Expenses</span>
            <span className="pl-value pl-expenses">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="pl-divider" />
          <div className={`pl-row pl-total ${profitLossClass}`}>
            <span className="pl-label">Net Profit / Loss</span>
            <span className="pl-value">{formatCurrency(netProfitLoss)}</span>
          </div>
          <div className={`pl-badge ${profitLossClass}`}>{profitLossLabel}</div>
        </div>
      </Card>
    </div>
  )
}
