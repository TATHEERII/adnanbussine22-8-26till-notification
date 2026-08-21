import { useState, useMemo } from 'react'
import { useSettings } from '../context/SettingsContext'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
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

  const { registers, purchases, sales, expenses, payments, approveItem, rejectItem } = useData()

  const current = useAuth()

  const [activeTab, setActiveTab] = useState('')
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

  const handleApprove = async (item) => {
    if (!item) return

    try {
      await approveItem(item.type, item.id)
      setShowViewModal(false)
      setSelectedItem(null)
    } catch (err) {
      alert(err.message || 'Failed to approve request')
    }
  }

  const handleReject = async (e, item) => {
    e.preventDefault()
    if (!item || !rejectionReason.trim()) return

    try {
      await rejectItem(item.type, item.id, rejectionReason.trim())
      setRejectionReason('')
      setShowRejectModal(false)
      setShowViewModal(false)
      setSelectedItem(null)
    } catch (err) {
      alert(err.message || 'Failed to reject request')
    }
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

  const tabOptions = tabs.map((tab) => ({
    value: tab.key,
    label: `${tab.label} (${tab.count})`,
  }))

  const getCurrentItems = () => {
    if (!activeTab) return []
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

      <div className="approvals-select-bar">
        <Select
          options={tabOptions}
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="approvals-select"
          placeholder="Select approval type"
        />
      </div>

      <div className="approvals-content">
        <div className="approvals-content-header">
          <h2 className="approvals-content-title">{activeTab ? `${tabs.find((t) => t.key === activeTab)?.label || 'Items'} Approvals` : 'Approvals'}</h2>
          <span className="approvals-content-subtitle">{currentItems.length} pending item{currentItems.length !== 1 ? 's' : ''}</span>
        </div>
        <Table columns={columns} data={currentItems} emptyText="No pending approvals found." cardViewOnMobile />
      </div>

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
