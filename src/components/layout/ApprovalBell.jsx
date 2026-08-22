import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { useData } from '../../context/DataContext'
import { getNotifications, markNotificationsRead } from '../../services/notifications'
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

function findTransaction(lists, entityType, id) {
  const key = entityType
  if (key === 'register') {
    return (lists.registers || []).find((r) => r.id === id) || null
  }
  if (key === 'purchase') {
    return (lists.purchases || []).find((p) => p.id === id) || null
  }
  if (key === 'sale') {
    return (lists.sales || []).find((s) => s.id === id) || null
  }
  if (key === 'expense') {
    return (lists.expenses || []).find((e) => e.id === id) || null
  }
  if (key === 'payment') {
    return (lists.payments || []).find((p) => p.id === id) || null
  }
  return null
}

export default function ApprovalBell({ user }) {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showNotifDetailModal, setShowNotifDetailModal] = useState(false)

  const { registers, purchases, sales, expenses, payments, approveItem, rejectItem, refreshData } = useData()
  const notifTimerRef = useRef(null)
  const broadcastRef = useRef(null)
  const pendingDismissRef = useRef(new Set())

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

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications({ unread: true })
      const filtered = (data || []).filter((n) => !pendingDismissRef.current.has(n.id))
      setNotifications(filtered)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  const broadcastRefresh = () => {
    try {
      if (!broadcastRef.current) {
        broadcastRef.current = new BroadcastChannel('importbiz-sync')
      }
      broadcastRef.current.postMessage({ type: 'refresh' })
    } catch {
      // BroadcastChannel not supported
    }
  }

  const dismissNotification = async (notif) => {
    const id = notif.id
    pendingDismissRef.current.add(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))

    try {
      await markNotificationsRead([id])
    } catch (err) {
      console.error('Failed to dismiss notification', err)
    } finally {
      pendingDismissRef.current.delete(id)
    }
  }

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif)
    setShowNotifDetailModal(true)
    await dismissNotification(notif)
  }

  const handleClearAllNotifications = async () => {
    try {
      const ids = notifications.map((n) => n.id)
      if (ids.length === 0) return
      ids.forEach((id) => pendingDismissRef.current.add(id))
      await markNotificationsRead(ids)
      setNotifications([])
    } catch (err) {
      console.error('Failed to clear notifications', err)
      alert(err.message || 'Failed to clear notifications')
    } finally {
      ids.forEach((id) => pendingDismissRef.current.delete(id))
    }
  }

  // Listen for BroadcastChannel messages for instant same-browser sync.
  useEffect(() => {
    let channel
    try {
      channel = new BroadcastChannel('importbiz-sync')
      channel.onmessage = () => {
        refreshData()
        fetchNotifications()
      }
      broadcastRef.current = channel
    } catch {
      // BroadcastChannel not supported
    }
    return () => {
      if (channel) channel.close()
    }
  }, [refreshData])

  // Poll notifications every 2 seconds for near-real-time updates.
  useEffect(() => {
    const startPolling = () => {
      if (notifTimerRef.current) clearInterval(notifTimerRef.current)
      notifTimerRef.current = setInterval(() => {
        fetchNotifications()
      }, 2000)
    }

    const stopPolling = () => {
      if (notifTimerRef.current) {
        clearInterval(notifTimerRef.current)
        notifTimerRef.current = null
      }
    }

    if (document.visibilityState === 'visible') {
      startPolling()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications()
        startPolling()
      } else {
        stopPolling()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      stopPolling()
    }
  }, [])

  // Pause notification polling while a notification detail modal is open
  // to avoid race conditions between local optimistic removal and server sync.
  useEffect(() => {
    if (showNotifDetailModal) {
      if (notifTimerRef.current) {
        clearInterval(notifTimerRef.current)
        notifTimerRef.current = null
      }
      return
    }

    if (document.visibilityState === 'visible') {
      if (notifTimerRef.current) clearInterval(notifTimerRef.current)
      notifTimerRef.current = setInterval(() => {
        fetchNotifications()
      }, 2000)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications()
        if (notifTimerRef.current) clearInterval(notifTimerRef.current)
        notifTimerRef.current = setInterval(() => {
          fetchNotifications()
        }, 2000)
      } else {
        if (notifTimerRef.current) {
          clearInterval(notifTimerRef.current)
          notifTimerRef.current = null
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      if (notifTimerRef.current) {
        clearInterval(notifTimerRef.current)
        notifTimerRef.current = null
      }
    }
  }, [showNotifDetailModal])

  useEffect(() => {
    fetchNotifications()
  }, [])

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

  const handleApprove = async (item) => {
    if (!item) return

    try {
      await approveItem(item.type, item.id)
      broadcastRefresh()
      setShowDetailModal(false)
      setSelectedItem(null)
      fetchNotifications()
    } catch (err) {
      alert(err.message || 'Failed to approve request')
    }
  }

  const handleReject = async (e, item) => {
    e.preventDefault()
    if (!item || !rejectionReason.trim()) return

    try {
      await rejectItem(item.type, item.id, rejectionReason.trim())
      broadcastRefresh()
      setRejectionReason('')
      setShowRejectModal(false)
      setShowDetailModal(false)
      setSelectedItem(null)
      fetchNotifications()
    } catch (err) {
      alert(err.message || 'Failed to reject request')
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

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    const symbol = '$'
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const notificationEntityType = selectedNotification?.type?.startsWith('approval_')
    ? selectedNotification.type.replace('approval_', '')
    : null

  const notifTransaction = useMemo(() => {
    if (!selectedNotification || !notificationEntityType) return null
    return findTransaction(
      { registers, purchases, sales, expenses, payments },
      notificationEntityType,
      selectedNotification.reference
    )
  }, [selectedNotification, notificationEntityType, registers, purchases, sales, expenses, payments])

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
        {notifications.length > 0 && pendingItems.length === 0 && (
          <span className="approval-bell-badge approval-bell-badge-notif">
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="approval-bell-dropdown">
          <div className="approval-bell-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                className="approval-bell-clear-all"
                onClick={handleClearAllNotifications}
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="approval-bell-notifications">
              {notifications.slice(0, 8).map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  className="approval-bell-notification-item"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <span className="approval-bell-notification-icon">🔔</span>
                  <span className="approval-bell-notification-text">{notif.message}</span>
                  <span
                    className="approval-bell-notification-dismiss"
                    onClick={(e) => {
                      e.stopPropagation()
                      dismissNotification(notif)
                    }}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="approval-bell-list">
            {pendingItems.length === 0 && notifications.length === 0 ? (
              <div className="approval-bell-empty">No pending approvals or notifications</div>
            ) : pendingItems.length === 0 ? (
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

      <Modal open={showNotifDetailModal} onClose={() => { setShowNotifDetailModal(false); setSelectedNotification(null); }} title="Notification Details">
        {selectedNotification && (
          <div className="approval-bell-details">
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Message</span>
              <span className="approval-bell-detail-value">{selectedNotification.message}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Type</span>
              <span className="approval-bell-detail-value">{notificationEntityType ? typeLabels[notificationEntityType] || notificationEntityType : selectedNotification.type}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Reference</span>
              <span className="approval-bell-detail-value">{selectedNotification.reference || '-'}</span>
            </div>
            <div className="approval-bell-detail-row">
              <span className="approval-bell-detail-label">Status</span>
              <span className="approval-bell-detail-value">
                <Badge variant={notifTransaction?.status === 'approved' ? 'success' : notifTransaction?.status === 'rejected' ? 'danger' : 'warning'}>
                  {notifTransaction?.status || 'Updated'}
                </Badge>
              </span>
            </div>
            {notifTransaction && (
              <>
                <div className="approval-bell-detail-row">
                  <span className="approval-bell-detail-label">Date</span>
                  <span className="approval-bell-detail-value">{formatDate(notifTransaction.date || notifTransaction.createdAt)}</span>
                </div>
                {notifTransaction.amount && (
                  <div className="approval-bell-detail-row">
                    <span className="approval-bell-detail-label">Amount</span>
                    <span className="approval-bell-detail-value">{formatCurrency(notifTransaction.amount)}</span>
                  </div>
                )}
                <div className="approval-bell-detail-row">
                  <span className="approval-bell-detail-label">Description</span>
                  <span className="approval-bell-detail-value">{getDescription(notifTransaction) || '-'}</span>
                </div>
              </>
            )}
            <div className="approval-bell-modal-actions">
              <Button variant="secondary" onClick={() => { setShowNotifDetailModal(false); setSelectedNotification(null); }}>Close</Button>
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
