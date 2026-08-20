import { useState, useMemo } from 'react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Table from '../components/ui/Table'
import { mockRegisters } from '../data/mockData'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import './Reports.css'

const reportTabs = [
  { key: 'sales', label: 'Sales Report' },
  { key: 'purchases', label: 'Purchase Report' },
  { key: 'expenses', label: 'Expense Report' },
  { key: 'payments', label: 'Payment Report' },
  { key: 'profitloss', label: 'Profit / Loss' },
  { key: 'registers', label: 'Register Summary' },
]

const formatCurrency = (amount) => {
  const num = Number(amount) || 0
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Reports() {
  const [registers] = useLocalStorageState('importbiz_v2_registers', mockRegisters)
  const [purchases] = useLocalStorageState('importbiz_v2_purchases', [])
  const [sales] = useLocalStorageState('importbiz_v2_sales', [])
  const [expenses] = useLocalStorageState('importbiz_v2_expenses', [])
  const [payments] = useLocalStorageState('importbiz_v2_payments', [])

  const [activeTab, setActiveTab] = useState('sales')
  const [registerFilter, setRegisterFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const activeRegisters = useMemo(() => {
    return registers.filter((r) => r.status === 'active')
  }, [registers])

  const registerOptions = activeRegisters.map((r) => ({
    value: r.id,
    label: r.name,
  }))

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'draft', label: 'Draft' },
  ]

  const filterByDate = (items) => {
    return items.filter((item) => {
      if (!item.date) return true
      if (dateFrom && item.date < dateFrom) return false
      if (dateTo && item.date > dateTo) return false
      return true
    })
  }

  const filterByRegister = (items) => {
    if (!registerFilter) return items
    return items.filter((item) => item.registerId === registerFilter)
  }

  const filterByStatus = (items) => {
    if (!statusFilter) return items
    return items.filter((item) => item.status === statusFilter)
  }

  const salesData = useMemo(() => {
    let data = (sales || []).filter((s) => s.status === 'approved')
    data = filterByDate(data)
    data = filterByRegister(data)
    data = filterByStatus(data)
    return data
  }, [sales, registerFilter, dateFrom, dateTo, statusFilter])

  const purchasesData = useMemo(() => {
    let data = (purchases || []).filter((p) => p.status === 'approved')
    data = filterByDate(data)
    data = filterByRegister(data)
    data = filterByStatus(data)
    return data
  }, [purchases, registerFilter, dateFrom, dateTo, statusFilter])

  const expensesData = useMemo(() => {
    let data = (expenses || []).filter((e) => e.status === 'approved')
    data = filterByDate(data)
    data = filterByRegister(data)
    data = filterByStatus(data)
    return data
  }, [expenses, registerFilter, dateFrom, dateTo, statusFilter])

  const paymentsData = useMemo(() => {
    let data = (payments || []).filter((pm) => pm.status === 'approved')
    data = filterByDate(data)
    data = filterByRegister(data)
    data = filterByStatus(data)
    return data
  }, [payments, registerFilter, dateFrom, dateTo, statusFilter])

  const profitLossData = useMemo(() => {
    const totalSales = salesData.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
    const totalPurchases = purchasesData.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const totalExpenses = expensesData.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const net = totalSales - totalPurchases - totalExpenses
    return { totalSales, totalPurchases, totalExpenses, net }
  }, [salesData, purchasesData, expensesData])

  const registerSummaryData = useMemo(() => {
    const summary = activeRegisters.map((reg) => {
      const regSales = (sales || []).filter((s) => s.registerId === reg.id && s.status === 'approved')
      const regPurchases = (purchases || []).filter((p) => p.registerId === reg.id && p.status === 'approved')
      const regExpenses = (expenses || []).filter((e) => e.registerId === reg.id && e.status === 'approved')
      const regPayments = (payments || []).filter((pm) => pm.registerId === reg.id && pm.status === 'approved')

      const totalSales = regSales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
      const totalPurchases = regPurchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      const totalExpenses = regExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      const totalPayments = regPayments.reduce((sum, pm) => sum + (Number(pm.amount) || 0), 0)

      return {
        id: reg.id,
        name: reg.name,
        type: reg.type,
        openingBalance: Number(reg.openingBalance) || 0,
        totalSales,
        totalPurchases,
        totalExpenses,
        totalPayments,
        transactionCount: regSales.length + regPurchases.length + regExpenses.length + regPayments.length,
      }
    })
    return summary
  }, [activeRegisters, sales, purchases, expenses, payments])

  const handlePrint = () => {
    window.print()
  }

  const renderSalesTable = () => {
    const columns = [
      { key: 'saleNumber', label: 'Sale No.' },
      { key: 'date', label: 'Date', render: (val) => formatDate(val) },
      { key: 'register', label: 'Register' },
      { key: 'customerName', label: 'Customer' },
      { key: 'description', label: 'Description' },
      {
        key: 'amount',
        label: 'Amount',
        render: (val) => <span className="report-amount">{formatCurrency(val)}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (val) => <Badge variant={val === 'approved' ? 'success' : val === 'pending' ? 'warning' : 'default'}>{val}</Badge>,
      },
    ]
    return <Table columns={columns} data={salesData} emptyText="No approved sales found." />
  }

  const renderPurchasesTable = () => {
    const columns = [
      { key: 'purchaseNumber', label: 'Purchase No.' },
      { key: 'date', label: 'Date', render: (val) => formatDate(val) },
      { key: 'register', label: 'Register' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'description', label: 'Description' },
      {
        key: 'amount',
        label: 'Amount',
        render: (val) => <span className="report-amount">{formatCurrency(val)}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (val) => <Badge variant={val === 'approved' ? 'success' : val === 'pending' ? 'warning' : 'default'}>{val}</Badge>,
      },
    ]
    return <Table columns={columns} data={purchasesData} emptyText="No approved purchases found." />
  }

  const renderExpensesTable = () => {
    const columns = [
      { key: 'expenseNumber', label: 'Expense No.' },
      { key: 'date', label: 'Date', render: (val) => formatDate(val) },
      { key: 'register', label: 'Register' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      {
        key: 'amount',
        label: 'Amount',
        render: (val) => <span className="report-amount report-expense">{formatCurrency(val)}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (val) => <Badge variant={val === 'approved' ? 'success' : val === 'pending' ? 'warning' : 'default'}>{val}</Badge>,
      },
    ]
    return <Table columns={columns} data={expensesData} emptyText="No approved expenses found." />
  }

  const renderPaymentsTable = () => {
    const columns = [
      { key: 'paymentNumber', label: 'Payment No.' },
      { key: 'date', label: 'Date', render: (val) => formatDate(val) },
      { key: 'register', label: 'Register' },
      {
        key: 'type',
        label: 'Type',
        render: (val) => <Badge variant={val === 'Received' ? 'success' : 'danger'}>{val}</Badge>,
      },
      { key: 'partyName', label: 'Party' },
      {
        key: 'amount',
        label: 'Amount',
        render: (val) => <span className="report-amount">{formatCurrency(val)}</span>,
      },
      {
        key: 'paymentMethod',
        label: 'Method',
        render: (val) => <Badge variant={val === 'Cash' ? 'default' : 'info'}>{val}</Badge>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (val) => <Badge variant={val === 'approved' ? 'success' : val === 'pending' ? 'warning' : 'default'}>{val}</Badge>,
      },
    ]
    return <Table columns={columns} data={paymentsData} emptyText="No approved payments found." />
  }

  const renderProfitLoss = () => {
    return (
      <div className="profit-loss-container">
        <div className="profit-loss-cards">
          <div className="profit-loss-card">
            <span className="profit-loss-label">Total Sales</span>
            <span className="profit-loss-value profit-loss-sales">{formatCurrency(profitLossData.totalSales)}</span>
          </div>
          <div className="profit-loss-card">
            <span className="profit-loss-label">Total Purchases</span>
            <span className="profit-loss-value profit-loss-purchase">{formatCurrency(profitLossData.totalPurchases)}</span>
          </div>
          <div className="profit-loss-card">
            <span className="profit-loss-label">Total Expenses</span>
            <span className="profit-loss-value profit-loss-expense">{formatCurrency(profitLossData.totalExpenses)}</span>
          </div>
        </div>
        <div className="profit-loss-result">
          <span className="profit-loss-result-label">Net Profit / Loss</span>
          <span className={`profit-loss-result-value ${profitLossData.net >= 0 ? 'profit-loss-profit' : 'profit-loss-loss'}`}>
            {profitLossData.net >= 0 ? 'Profit' : 'Loss'}: {formatCurrency(Math.abs(profitLossData.net))}
          </span>
        </div>
        <div className="profit-loss-formula">
          <span className="profit-loss-formula-text">
            Total Approved Sales ({formatCurrency(profitLossData.totalSales)}) - Total Approved Purchases ({formatCurrency(profitLossData.totalPurchases)}) - Total Approved Expenses ({formatCurrency(profitLossData.totalExpenses)}) ={' '}
            <strong>{formatCurrency(profitLossData.net)}</strong>
          </span>
        </div>
      </div>
    )
  }

  const renderRegisterSummary = () => {
    const columns = [
      { key: 'name', label: 'Register' },
      { key: 'type', label: 'Type', render: (val) => <Badge variant="info">{val}</Badge> },
      {
        key: 'openingBalance',
        label: 'Opening Balance',
        render: (val) => <span className="report-amount">{formatCurrency(val)}</span>,
      },
      {
        key: 'totalSales',
        label: 'Total Sales',
        render: (val) => <span className="report-amount report-sales">{formatCurrency(val)}</span>,
      },
      {
        key: 'totalPurchases',
        label: 'Total Purchases',
        render: (val) => <span className="report-amount report-purchase">{formatCurrency(val)}</span>,
      },
      {
        key: 'totalExpenses',
        label: 'Total Expenses',
        render: (val) => <span className="report-amount report-expense">{formatCurrency(val)}</span>,
      },
      {
        key: 'totalPayments',
        label: 'Total Payments',
        render: (val) => <span className="report-amount">{formatCurrency(val)}</span>,
      },
      {
        key: 'transactionCount',
        label: 'Transactions',
        render: (val) => <Badge variant="default">{val}</Badge>,
      },
    ]
    return <Table columns={columns} data={registerSummaryData} emptyText="No active registers found." />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return renderSalesTable()
      case 'purchases':
        return renderPurchasesTable()
      case 'expenses':
        return renderExpensesTable()
      case 'payments':
        return renderPaymentsTable()
      case 'profitloss':
        return renderProfitLoss()
      case 'registers':
        return renderRegisterSummary()
      default:
        return null
    }
  }

  const getReportTitle = () => {
    return reportTabs.find((t) => t.key === activeTab)?.label || 'Report'
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and view business reports.</p>
      </div>

      <div className="reports-tabs">
        {reportTabs.map((tab) => (
          <button
            key={tab.key}
            className={`reports-tab ${activeTab === tab.key ? 'reports-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card
        title={getReportTitle()}
        subtitle={`${activeTab === 'profitloss' ? 'Profit/Loss summary' : activeTab === 'registers' ? 'Overview by register' : 'Approved transactions only'}`}
        actions={
          <div className="reports-toolbar">
            <Select
              options={registerOptions}
              value={registerFilter}
              onChange={(e) => setRegisterFilter(e.target.value)}
              className="reports-filter"
              placeholder="All Registers"
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="reports-filter"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="reports-filter"
              placeholder="To"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="reports-filter"
              placeholder="All Statuses"
            />
            <Button variant="secondary" onClick={handlePrint}>Print</Button>
            <Button variant="secondary" onClick={() => alert('Export feature coming soon.')}>Export</Button>
          </div>
        }
      >
        {renderContent()}
      </Card>
    </div>
  )
}
