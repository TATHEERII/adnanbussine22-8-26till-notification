import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { useAuditLog } from '../../hooks/useAuditLog'
import { mockRegisters } from '../../data/mockData'
import './ApprovalBell.css'

const typeIcons = {
  register: '📒',
  purchase: '🛒',
  sale: '💰',
  expense: '🧾',
  payment: '💳',
}

const typeLabels = {
  register: 'Register',
  purchase: 'Purchase',
  sale: 'Sale',
  expense: 'Expense',
  payment: 'Payment',
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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

export default function ApprovalBell({ user }) {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const [registers, setRegisters] = useLocalStorageState('importbiz_v2_registers', mockRegisters)
  const [purchases, setPurchases] = useLocalStorageState('importbiz_v2_purchases', [])
  const [sales, setSales] = useLocalStorageState('importbiz_v2_sales', [])
  const [expenses, setExpenses] = useLocalStorageState('importbiz_v2_expenses', [])
  const [payments, setPayments] = useLocalStorageState('importbiz_v2_payments', [])

  const { addLog } = useAuditLog()

  const pendingItems = useMemo(() => {
    const items = []
    const currentId = user?.id

    if (currentId) {
      registers.forEach((r) => {
        if (r.status === 'pending' && r.ownerId !== currentId) {
          items.push({ ...r, type: 'register' })
        }
      })
      purchases.forEach((p) => {
        if (p.status === 'pending' && p.createdById !== currentId) {
          items.push({ ...p, type: 'purchase' })
        }
      })
      sales.forEach((s) => {
        if (s.status === 'pending' && s.createdById !== currentId) {
          items.push({ ...s, type: 'sale' })
        }
      })
      expenses.forEach((e) => {
        if (e.status === 'pending' && e.createdById !== currentId) {
          items.push({ ...e, type: 'expense' })
        }
      })
      payments.forEach((pm) => {
        if (pm.status === 'pending' && pm.createdById !== currentId) {
          items.push({ ...pm, type: 'payment' })
        }
      })
    }

    return items.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [registers, purchases, sales, expenses, payments, user?.id])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.approval-bell-container')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const openReject = () => {
    setShowRejectModal(true)
  }

  const handleViewAll = () => {
    setShowDropdown(false)
    navigate('/approvals')
  }

  const handleApprove = (item) => {
    if (!item) return

    const { type, id } = item

    switch (type) {
      case 'register':
        setRegisters((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'active', rejectionReason: '' } : r))
        )
        addLog({ user: user?.name, action: 'Register Approved', module: 'Registers', reference: `REG-${item.id.replace('r', '').padStart(5, '0')}`, register: '-', description: 'Approved register request', oldStatus: 'Pending Approval', newStatus: 'Active' })
        break
      case 'purchase':
        setPurchases((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'approved', rejectionReason: '' } : p))
        )
        addLog({ user: user?.name, action: 'Purchase Approved', module: 'Purchases', reference: item.purchaseNumber, register: item.register, description: 'Approved purchase order', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      case 'sale':
        setSales((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'approved', rejectionReason: '' } : s))
        )
        addLog({ user: user?.name, action: 'Sale Approved', module: 'Sales', reference: item.saleNumber, register: item.register, description: 'Approved sale record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      case 'expense':
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'approved', rejectionReason: '' } : e))
        )
        addLog({ user: user?.name, action: 'Expense Approved', module: 'Expenses', reference: item.expenseNumber, register: item.register, description: 'Approved expense record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      case 'payment':
        setPayments((prev) =>
          prev.map((pm) => (pm.id === id ? { ...pm, status: 'approved', rejectionReason: '' } : pm))
        )
        addLog({ user: user?.name, action: 'Payment Approved', module: 'Payments', reference: item.paymentNumber, register: item.register, description: 'Approved payment record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
        break
      default:
        break
    }

    setShowDetailModal(false)
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
        addLog({ user: user?.name, action: 'Register Rejected', module: 'Registers', reference: `REG-${item.id.replace('r', '').padStart(5, '0')}`, register: '-', description: 'Rejected register request', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'purchase':
        setPurchases((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'rejected', rejectionReason: rejectionReason.trim() } : p))
        )
        addLog({ user: user?.name, action: 'Purchase Rejected', module: 'Purchases', reference: item.purchaseNumber, register: item.register, description: 'Rejected purchase order', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'sale':
        setSales((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'rejected', rejectionReason: rejectionReason.trim() } : s))
        )
        addLog({ user: user?.name, action: 'Sale Rejected', module: 'Sales', reference: item.saleNumber, register: item.register, description: 'Rejected sale record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'expense':
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'rejected', rejectionReason: rejectionReason.trim() } : e))
        )
        addLog({ user: user?.name, action: 'Expense Rejected', module: 'Expenses', reference: item.expenseNumber, register: item.register, description: 'Rejected expense record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      case 'payment':
        setPayments((prev) =>
          prev.map((pm) => (pm.id === id ? { ...pm, status: 'rejected', rejectionReason: rejectionReason.trim() } : pm))
        )
        addLog({ user: user?.name, action: 'Payment Rejected', module: 'Payments', reference: item.paymentNumber, register: item.register, description: 'Rejected payment record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
        break
      default:
        break
    }

    setRejectionReason('')
    setShowRejectModal(false)
    setShowDetailModal(false)
    setSelectedItem(null)
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

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    const symbol = '$'
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="approval-bell-container">
      <button
        type="button"
        className="approval-bell-btn"
        onClick={() => setShowDropdown((prev) => !prev)}
        aria-label="Notifications"
      >
        🔔
        {pendingItems.length > 0 && (
          <span className="approval-bell-badge">
            {pendingItems.length > 99 ? '99+' : pendingItems.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="approval-bell-dropdown">
          <div className="approval-bell-header">
            <h3>Pending Approvals</h3>
            <Badge variant="warning">{pendingItems.length}</Badge>
          </div>

          <div className="approval-bell-list">
            {pendingItems.length === 0 ? (
              <div className="approval-bell-empty">No pending approvals</div>
            ) : (
              pendingItems.slice(0, 8).map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  className="approval-bell-item"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="approval-bell-item-icon">
                    {typeIcons[item.type]}
                  </div>
                  <div className="approval-bell-item-info">
                    <div className="approval-bell-item-ref">
                      {getReferenceNumber(item)}
                    </div>
                    <div className="approval-bell-item-meta">
                      <span className="approval-bell-item-type">
                        {typeLabels[item.type]}
                      </span>
                      <span className="approval-bell-item-date">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                  <span className={`approval-bell-status approval-bell-status-${item.status}`}>
                    {item.status}
                  </span>
                </button>
              ))
            )}
          </div>

          {pendingItems.length > 0 && (
            <div className="approval-bell-footer">
              <button
                type="button"
                className="approval-bell-view-all"
                onClick={handleViewAll}
              >
                View All Approvals
              </button>
            </div>
          )}
        </div>
      )}

      <Modal open={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedItem(null); }} title="Approval Details">
        {selectedItem && (
          <div className="approval-bell-details">
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Reference</span>
              <span className="approval-bell-detail-value">{getReferenceNumber(selectedItem)}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Type</span>
              <span className="approval-bell-detail-value">{typeLabels[selectedItem.type]}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Register</span>
              <span className="approval-bell-detail-value">{getRegisterName(selectedItem)}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Created By</span>
              <span className="approval-bell-detail-value">{selectedItem.createdBy}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Date</span>
              <span className="approval-bell-detail-value">{formatDate(selectedItem.date)}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Amount</span>
              <span className="approval-bell-detail-value">
                {getAmount(selectedItem) !== '-' ? formatCurrency(getAmount(selectedItem)) : '-'}
              </span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Description</span>
              <span className="approval-bell-detail-value">{getDescription(selectedItem) || '-'}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Status</span>
              <span className="approval-bell-detail-value">
                <Badge variant={selectedItem.status === 'pending' ? 'warning' : selectedItem.status === 'approved' ? 'success' : 'danger'}>
                  {selectedItem.status}
                </Badge>
              </span>
            </div>
            {selectedItem.status === 'rejected' && selectedItem.rejectionReason && (
              <div className="approval-bell-detail-row approval-bell-detail-rejection">
                <span className="approval-bell-detail-label">Rejection Reason</span>
                <span className="approval-bell-detail-value approval-bell-rejection-text">{selectedItem.rejectionReason}</span>
              </div>
            )}
            <div className="approval-bell-modal-actions">
              <Button variant="secondary" onClick={() => { setShowDetailModal(false); setSelectedItem(null); }}>Close</Button>
              <Button onClick={() => handleApprove(selectedItem)}>Approve</Button>
              <Button variant="danger" onClick={openReject}>Reject</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason(''); }} title="Reject Request">
        {selectedItem && (
          <form onSubmit={(e) => handleReject(e, selectedItem)}>
            <p className="approval-bell-reject-info">
              You are rejecting <strong>{getReferenceNumber(selectedItem)}</strong> created by <strong>{selectedItem.createdBy}</strong>.
            </p>
            <Input
              label="Rejection Reason"
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
            <div className="approval-bell-modal-actions">
              <Button type="button" variant="secondary" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}>Cancel</Button>
              <Button type="submit" variant="danger">Reject</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
