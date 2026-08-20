import { useState, useMemo } from 'react'
import { useSettings } from '../context/SettingsContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import { mockRegisters } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { useAuditLog } from '../hooks/useAuditLog'
import './Approvals.css'

const statusVariant = (status) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'default'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Approvals() {
  const { currencySymbol } = useSettings()

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const [registers, setRegisters] = useLocalStorageState('importbiz_v2_registers', mockRegisters)
  const [purchases, setPurchases] = useLocalStorageState('importbiz_v2_purchases', [])
  const [sales, setSales] = useLocalStorageState('importbiz_v2_sales', [])
  const [expenses, setExpenses] = useLocalStorageState('importbiz_v2_expenses', [])
  const [payments, setPayments] = useLocalStorageState('importbiz_v2_payments', [])

  const current = useAuth()
  const { addLog } = useAuditLog()

  const [activeTab, setActiveTab] = useState('registers')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const pendingRegisters = useMemo(() => {
    return registers.filter((r) => r.status === 'pending' && r.ownerId !== current.id)
  }, [registers, current.id])

  const pendingPurchases = useMemo(() => {
    return purchases.filter((p) => p.status === 'pending' && p.createdById !== current.id)
  }, [purchases, current.id])

  const pendingSales = useMemo(() => {
    return sales.filter((s) => s.status === 'pending' && s.createdById !== current.id)
  }, [sales, current.id])

  const pendingExpenses = useMemo(() => {
    return expenses.filter((e) => e.status === 'pending' && e.createdById !== current.id)
  }, [expenses, current.id])

  const pendingPayments = useMemo(() => {
    return payments.filter((pm) => pm.status === 'pending' && pm.createdById !== current.id)
  }, [payments, current.id])

  const openView = (item) => {
    setSelectedItem(item)
    setShowViewModal(true)
  }

  const openReject = (item) => {
    setSelectedItem(item)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleApprove = (item) => {
    if (!item) return

    const { type, id } = item

    switch (type) {
      case 'register':
        setRegisters((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'active', rejectionReason: '' } : r))
        )
        addLog({ user: current.name, action: 'Register Approved', module: 'Registers', reference: `REG-${item.id.replace('r', '').padStart(5, '0')}`, register: '-', description: 'Approved register request', oldStatus: 'Pending Approval', newStatus: 'Active' })
        break
      case 'purchase':
        setPurchases((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'approved', rejectionReason: '' } : p))
        )
        addLog({ user: current.name, action: 'Purchase Approved', module: 'Purchases', reference: item.purchaseNumber, register: item.register, description: 'Approved purchase order', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      case 'sale':
        setSales((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'approved', rejectionReason: '' } : s))
        )
        addLog({ user: current.name, action: 'Sale Approved', module: 'Sales', reference: item.saleNumber, register: item.register, description: 'Approved sale record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      case 'expense':
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'approved', rejectionReason: '' } : e))
        )
        addLog({ user: current.name, action: 'Expense Approved', module: 'Expenses', reference: item.expenseNumber, register: item.register, description: 'Approved expense record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      case 'payment':
        setPayments((prev) =>
          prev.map((pm) => (pm.id === id ? { ...pm, status: 'approved', rejectionReason: '' } : pm))
        )
        addLog({ user: current.name, action: 'Payment Approved', module: 'Payments', reference: item.paymentNumber, register: item.register, description: 'Approved payment record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      default:
        break
    }

    setShowViewModal(false)
    setSelectedItem(null)
  }

  const handleReject = (e, item) => {
    e.preventDefault()
    if (!item || !rejectionReason.trim()) return

    const { type, id } = item

    switch (type) {
      case 'register':
        setRegisters((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected', rejectionReason: rejectionReason.trim() } : r))
        )
        addLog({ user: current.name, action: 'Register Rejected', module: 'Registers', reference: `REG-${item.id.replace('r', '').padStart(5, '0')}`, register: '-', description: 'Rejected register request', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'purchase':
        setPurchases((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'rejected', rejectionReason: rejectionReason.trim() } : p))
        )
        addLog({ user: current.name, action: 'Purchase Rejected', module: 'Purchases', reference: item.purchaseNumber, register: item.register, description: 'Rejected purchase order', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'sale':
        setSales((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'rejected', rejectionReason: rejectionReason.trim() } : s))
        )
        addLog({ user: current.name, action: 'Sale Rejected', module: 'Sales', reference: item.saleNumber, register: item.register, description: 'Rejected sale record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'expense':
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'rejected', rejectionReason: rejectionReason.trim() } : e))
        )
        addLog({ user: current.name, action: 'Expense Rejected', module: 'Expenses', reference: item.expenseNumber, register: item.register, description: 'Rejected expense record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'payment':
        setPayments((prev) =>
          prev.map((pm) => (pm.id === id ? { ...pm, status: 'rejected', rejectionReason: rejectionReason.trim() } : pm))
        )
        addLog({ user: current.name, action: 'Payment Rejected', module: 'Payments', reference: item.paymentNumber, register: item.register, description: 'Rejected payment record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      default:
        break
    }

    setRejectionReason('')
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedItem(null)
  }

  const getReferenceNumber = (item) => {
    switch (item.type) {
      case 'register':
        return `REG-${item.id.replace('r', '').padStart(5, '0')}`
      case 'purchase':
        return item.purchaseNumber || '-'
      case 'sale':
        return item.saleNumber || '-'
      case 'expense':
        return item.expenseNumber || '-'
      case 'payment':
        return item.paymentNumber || '-'
      default:
        return '-'
    }
  }

  const getAmount = (item) => {
    switch (item.type) {
      case 'purchase':
        return item.amount
      case 'sale':
        return item.amount
      case 'expense':
        return item.amount
      case 'payment':
        return item.amount
      default:
        return '-'
    }
  }

  const getDescription = (item) => {
    switch (item.type) {
      case 'register':
        return item.description || item.name
      case 'purchase':
        return item.description || item.supplierName
      case 'sale':
        return item.description || item.customerName
      case 'expense':
        return item.description
      case 'payment':
        return item.description || item.partyName
      default:
        return '-'
    }
  }

  const getRegisterName = (item) => {
    switch (item.type) {
      case 'register':
        return '-'
      case 'purchase':
      case 'sale':
      case 'expense':
      case 'payment':
        return item.register || '-'
      default:
        return '-'
    }
  }

  const tabs = [
    { key: 'registers', label: 'Registers', count: pendingRegisters.length },
    { key: 'purchases', label: 'Purchases', count: pendingPurchases.length },
    { key: 'sales', label: 'Sales', count: pendingSales.length },
    { key: 'expenses', label: 'Expenses', count: pendingExpenses.length },
    { key: 'payments', label: 'Payments', count: pendingPayments.length },
  ]

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'registers':
        return pendingRegisters.map((r) => ({ ...r, type: 'register' }))
      case 'purchases':
        return pendingPurchases.map((p) => ({ ...p, type: 'purchase' }))
      case 'sales':
        return pendingSales.map((s) => ({ ...s, type: 'sale' }))
      case 'expenses':
        return pendingExpenses.map((e) => ({ ...e, type: 'expense' }))
      case 'payments':
        return pendingPayments.map((pm) => ({ ...pm, type: 'payment' }))
      default:
        return []
    }
  }

  const currentItems = getCurrentItems()

  const columns = [
    { key: 'reference', label: 'Reference', render: (_, row) => <span className="approval-ref">{getReferenceNumber(row)}</span> },
    { key: 'register', label: 'Register', render: (_, row) => getRegisterName(row) },
    { key: 'createdBy', label: 'Created By' },
    { key: 'date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'type', label: 'Type', render: (val) => <Badge variant={getTransactionVariant(val)}>{getTransactionTypeLabel(val)}</Badge> },
    {
      key: 'amount',
      label: 'Amount',
      render: (_, row) => {
        const amount = getAmount(row)
        return amount !== '-' ? <span className="approval-amount">{formatCurrency(amount)}</span> : '-'
      },
    },
    { key: 'description', label: 'Description', render: (_, row) => getDescription(row) },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={statusVariant(val)}>{val}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="approval-actions">
          <button className="table-action-btn" onClick={() => openView(row)} title="View Details">
            View
          </button>
          <button className="table-action-btn table-action-btn-success" onClick={() => handleApprove(row)} title="Approve">
            Approve
          </button>
          <button className="table-action-btn table-action-btn-danger" onClick={() => openReject(row)} title="Reject">
            Reject
          </button>
        </div>
      ),
    },
  ]

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'register':
        return 'Register'
      case 'purchase':
        return 'Purchase'
      case 'sale':
        return 'Sale'
      case 'expense':
        return 'Expense'
      case 'payment':
        return 'Payment'
      default:
        return type
    }
  }

  const getTransactionVariant = (type) => {
    switch (type) {
      case 'register':
        return 'info'
      case 'purchase':
        return 'danger'
      case 'sale':
        return 'success'
      case 'expense':
        return 'warning'
      case 'payment':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <div className="approvals-page">
      <div className="page-header">
        <h1 className="page-title">Approvals</h1>
        <p className="page-subtitle">Review and approve pending requests from other users.</p>
      </div>

      <div className="approvals-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`approvals-tab ${activeTab === tab.key ? 'approvals-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && <span className="approvals-tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      <Card
        title={`${tabs.find((t) => t.key === activeTab)?.label || 'Items'} Approvals`}
        subtitle={`${currentItems.length} pending item${currentItems.length !== 1 ? 's' : ''}`}
      >
        <Table columns={columns} data={currentItems} emptyText="No pending approvals found." />
      </Card>

      <Modal open={showViewModal} onClose={() => { setShowViewModal(false); setSelectedItem(null); }} title="Approval Details">
        {selectedItem && (
          <div className="view-details">
            <div className="view-row">
              <span className="view-label">Reference</span>
              <span className="view-value">{getReferenceNumber(selectedItem)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Type</span>
              <span className="view-value">{getTransactionTypeLabel(selectedItem.type)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Register</span>
              <span className="view-value">{getRegisterName(selectedItem)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Created By</span>
              <span className="view-value">{selectedItem.createdBy}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Date</span>
              <span className="view-value">{formatDate(selectedItem.date)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Amount</span>
              <span className="view-value">
                {getAmount(selectedItem) !== '-' ? formatCurrency(getAmount(selectedItem)) : '-'}
              </span>
            </div>
            <div className="view-row">
              <span className="view-label">Description</span>
              <span className="view-value">{getDescription(selectedItem) || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Status</span>
              <span className="view-value"><Badge variant={statusVariant(selectedItem.status)}>{selectedItem.status}</Badge></span>
            </div>
            {selectedItem.status === 'rejected' && selectedItem.rejectionReason && (
              <div className="view-row view-rejection">
                <span className="view-label">Rejection Reason</span>
                <span className="view-value view-rejection-text">{selectedItem.rejectionReason}</span>
              </div>
            )}
            <div className="modal-form-actions">
              <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedItem(null); }}>Close</Button>
              <Button onClick={() => handleApprove(selectedItem)}>Approve</Button>
              <Button variant="danger" onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}>Reject</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason(''); }} title="Reject Request">
        {selectedItem && (
          <form onSubmit={(e) => handleReject(e, selectedItem)}>
            <p className="reject-info">
              You are rejecting <strong>{getReferenceNumber(selectedItem)}</strong> created by <strong>{selectedItem.createdBy}</strong>.
            </p>
            <Input
              label="Rejection Reason"
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
            <div className="modal-form-actions">
              <Button type="button" variant="secondary" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}>Cancel</Button>
              <Button type="submit" variant="danger">Reject</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
