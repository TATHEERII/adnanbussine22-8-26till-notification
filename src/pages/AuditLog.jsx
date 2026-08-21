import { useState, useMemo } from 'react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Table from '../components/ui/Table'
import { mockAuditLogs } from '../data/mockData'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import './AuditLog.css'

const moduleOptions = [
  { value: '', label: 'All Modules' },
  { value: 'Registers', label: 'Registers' },
  { value: 'Purchases', label: 'Purchases' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Expenses', label: 'Expenses' },
  { value: 'Payments', label: 'Payments' },
  { value: 'Auth', label: 'Auth' },
]

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'Created', label: 'Created' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Login', label: 'Login' },
  { value: 'Logout', label: 'Logout' },
]

const statusVariant = (status) => {
  switch (status) {
    case 'active':
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    case 'draft':
      return 'default'
    default:
      return 'default'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AuditLog() {
  const [auditLogs, setAuditLogs] = useLocalStorageState('importbiz_v2_audit_logs', mockAuditLogs)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const filtered = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        !search ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.reference.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.register.toLowerCase().includes(search.toLowerCase())
      const matchesDateRange = !dateFrom || !dateTo || (log.date >= dateFrom && log.date <= dateTo)
      const matchesModule = !moduleFilter || log.module === moduleFilter
      const matchesAction = !actionFilter || log.action.toLowerCase().includes(actionFilter.toLowerCase())
      return matchesSearch && matchesDateRange && matchesModule && matchesAction
    })
  }, [auditLogs, search, dateFrom, dateTo, moduleFilter, actionFilter])

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action', render: (val) => <Badge variant={val === 'Approved' ? 'success' : val === 'Rejected' ? 'danger' : val === 'Submitted' ? 'warning' : 'default'}>{val}</Badge> },
    { key: 'module', label: 'Module', render: (val) => <Badge variant="info">{val}</Badge> },
    { key: 'reference', label: 'Reference', render: (val) => <span className="audit-ref">{val}</span> },
    { key: 'register', label: 'Register' },
    { key: 'date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'time', label: 'Time' },
    { key: 'description', label: 'Description' },
    {
      key: 'oldStatus',
      label: 'Old Status',
      render: (val) => (val && val !== '-' ? <Badge variant={statusVariant(val)}>{val}</Badge> : '-'),
    },
    {
      key: 'newStatus',
      label: 'New Status',
      render: (val) => (val && val !== '-' ? <Badge variant={statusVariant(val)}>{val}</Badge> : '-'),
    },
  ]

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="audit-page">
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Track all important system actions.</p>
      </div>

      <div className="audit-filter-bar">
        <Input
          placeholder="Search audit log..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="audit-search"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="audit-filter"
          placeholder="From"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="audit-filter"
          placeholder="To"
        />
        <Select
          options={moduleOptions}
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="audit-filter"
          placeholder="All Modules"
        />
        <Select
          options={actionOptions}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="audit-filter"
          placeholder="All Actions"
        />
        <Button variant="secondary" onClick={handlePrint}>Print</Button>
      </div>

      <div className="audit-content">
        <div className="audit-content-header">
          <h2 className="audit-content-title">Audit Log</h2>
          <span className="audit-content-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <Table columns={columns} data={filtered} emptyText="No audit logs found." cardViewOnMobile />
      </div>
    </div>
  )
}
