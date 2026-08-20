import { useState, useMemo } from 'react'
import { useSettings } from '../context/SettingsContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import FormLayout, { FormSection } from '../components/ui/FormLayout'
import Table from '../components/ui/Table'
import { mockPayments, mockRegisters } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { useAuditLog } from '../hooks/useAuditLog'
import './Payments.css'

const paymentTypeOptions = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Received', label: 'Received' },
]

const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank', label: 'Bank' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const statusVariant = (status) => {
  switch (status) {
    case 'active':
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

const generatePaymentNumber = (payments) => {
  const maxNum = payments.reduce((max, pm) => {
    const num = parseInt(pm.paymentNumber.replace('PAY-', ''), 10)
    return num > max ? num : max
  }, 0)
  return `PAY-${String(maxNum + 1).padStart(5, '0')}`
}

export default function Payments() {
  const { currencySymbol } = useSettings()

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const [payments, setPayments] = useLocalStorageState('importbiz_v2_payments', mockPayments)
  const [registers] = useLocalStorageState('importbiz_v2_registers', mockRegisters)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [registerFilter, setRegisterFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    registerId: '',
    type: 'Paid',
    partyName: '',
    reference: '',
    amount: '',
    paymentMethod: 'Cash',
    description: '',
    notes: '',
  })

  const current = useAuth()
  const { addLog } = useAuditLog()

  const activeRegisters = useMemo(() => {
    return registers.filter((r) => r.status === 'active')
  }, [registers])

  const activeRegisterOptions = activeRegisters.map((r) => ({
    value: r.id,
    label: r.name,
  }))

  const filtered = useMemo(() => {
    return payments.filter((pm) => {
      const matchesSearch =
        !search ||
        pm.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        pm.partyName.toLowerCase().includes(search.toLowerCase()) ||
        pm.reference.toLowerCase().includes(search.toLowerCase()) ||
        pm.description.toLowerCase().includes(search.toLowerCase()) ||
        pm.register.toLowerCase().includes(search.toLowerCase())
      const matchesDate = !dateFilter || pm.date === dateFilter
      const matchesRegister = !registerFilter || pm.registerId === registerFilter
      const matchesType = !typeFilter || pm.type === typeFilter
      const matchesStatus = !statusFilter || pm.status === statusFilter
      return matchesSearch && matchesDate && matchesRegister && matchesType && matchesStatus
    })
  }, [payments, search, dateFilter, registerFilter, typeFilter, statusFilter])

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      registerId: '',
      type: 'Paid',
      partyName: '',
      reference: '',
      amount: '',
      paymentMethod: 'Cash',
      description: '',
      notes: '',
    })
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!formData.partyName.trim() || !formData.registerId || !formData.amount) return

    const selectedReg = registers.find((r) => r.id === formData.registerId)
    const newPayment = {
      id: `pm${Date.now()}`,
      paymentNumber: generatePaymentNumber(payments),
      date: formData.date,
      register: selectedReg ? selectedReg.name : '',
      registerId: formData.registerId,
      type: formData.type,
      partyName: formData.partyName.trim(),
      reference: formData.reference.trim(),
      amount: Number(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      description: formData.description.trim(),
      status: 'draft',
      createdBy: current.name,
      createdById: current.id,
      notes: formData.notes.trim(),
      rejectionReason: '',
    }

    setPayments((prev) => [newPayment, ...prev])
    addLog({ user: current.name, action: 'Payment Created', module: 'Payments', reference: newPayment.paymentNumber, register: selectedReg ? selectedReg.name : '', description: newPayment.description || `Payment ${newPayment.type} to ${newPayment.partyName}`, oldStatus: '-', newStatus: 'Draft' })
    resetForm()
    setShowCreateModal(false)
  }

  const handleEditDraft = (payment) => {
    setSelectedPayment(payment)
    setFormData({
      date: payment.date,
      registerId: payment.registerId,
      type: payment.type,
      partyName: payment.partyName,
      reference: payment.reference,
      amount: String(payment.amount || 0),
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      notes: payment.notes || '',
    })
    setShowCreateModal(true)
  }

  const handleUpdateDraft = (e) => {
    e.preventDefault()
    if (!selectedPayment || !formData.partyName.trim() || !formData.registerId || !formData.amount) return

    const selectedReg = registers.find((r) => r.id === formData.registerId)
    setPayments((prev) =>
      prev.map((pm) =>
        pm.id === selectedPayment.id
          ? {
              ...pm,
              date: formData.date,
              register: selectedReg ? selectedReg.name : '',
              registerId: formData.registerId,
              type: formData.type,
              partyName: formData.partyName.trim(),
              reference: formData.reference.trim(),
              amount: Number(formData.amount) || 0,
              paymentMethod: formData.paymentMethod,
              description: formData.description.trim(),
              notes: formData.notes.trim(),
            }
          : pm
      )
    )
    resetForm()
    setSelectedPayment(null)
    setShowCreateModal(false)
  }

  const handleSubmit = (paymentId) => {
    const payment = payments.find((pm) => pm.id === paymentId)
    if (!payment) return
    setPayments((prev) =>
      prev.map((pm) =>
        pm.id === paymentId ? { ...pm, status: 'pending' } : pm
      )
    )
    addLog({ user: current.name, action: 'Payment Submitted', module: 'Payments', reference: payment.paymentNumber, register: payment.register, description: 'Submitted payment for approval', oldStatus: 'Draft', newStatus: 'Pending Approval' })
  }

  const handleApprove = (paymentId) => {
    const payment = payments.find((pm) => pm.id === paymentId)
    if (!payment) return
    setPayments((prev) =>
      prev.map((pm) =>
        pm.id === paymentId ? { ...pm, status: 'approved', rejectionReason: '' } : pm
      )
    )
    addLog({ user: current.name, action: 'Payment Approved', module: 'Payments', reference: payment.paymentNumber, register: payment.register, description: 'Approved payment record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
    setShowViewModal(false)
    setSelectedPayment(null)
  }

  const handleReject = (e) => {
    e.preventDefault()
    if (!selectedPayment || !rejectionReason.trim()) return

    setPayments((prev) =>
      prev.map((pm) =>
        pm.id === selectedPayment.id
          ? { ...pm, status: 'rejected', rejectionReason: rejectionReason.trim() }
          : pm
      )
    )
    addLog({ user: current.name, action: 'Payment Rejected', module: 'Payments', reference: selectedPayment.paymentNumber, register: selectedPayment.register, description: 'Rejected payment record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
    setRejectionReason('')
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedPayment(null)
  }

  const openView = (payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const openReject = (payment) => {
    setSelectedPayment(payment)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const canApprove = (payment) => {
    if (payment.status !== 'pending') return false
    if (payment.createdById === current.id) return false
    return true
  }

  const canReject = (payment) => {
    if (payment.status !== 'pending') return false
    if (payment.createdById === current.id) return false
    return true
  }

  const isOwner = (payment) => payment.createdById === current.id

  const columns = [
    { key: 'paymentNumber', label: 'Payment No.' },
    { key: 'date', label: 'Date' },
    { key: 'register', label: 'Register' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <Badge variant={val === 'Received' ? 'success' : 'danger'}>{val}</Badge>,
    },
    { key: 'partyName', label: 'Party Name' },
    { key: 'reference', label: 'Reference' },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="table-amount">{formatCurrency(val)}</span>,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (val) => <Badge variant={val === 'Cash' ? 'default' : 'info'}>{val}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={statusVariant(val)}>{val}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const actions = []
        actions.push(
          <button key="view" className="table-action-btn" onClick={() => openView(row)} title="View">
            View
          </button>
        )

        if (row.status === 'draft' && isOwner(row)) {
          actions.push(
            <button key="edit" className="table-action-btn" onClick={() => handleEditDraft(row)} title="Edit Draft">
              Edit
            </button>
          )
          actions.push(
            <button key="submit" className="table-action-btn table-action-btn-primary" onClick={() => handleSubmit(row.id)} title="Submit for Approval">
              Submit
            </button>
          )
        }

        if (row.status === 'rejected' && isOwner(row)) {
          actions.push(
            <button key="resubmit" className="table-action-btn table-action-btn-primary" onClick={() => handleEditDraft(row)} title="Edit and Resubmit">
              Edit & Resubmit
            </button>
          )
        }

        if (canApprove(row)) {
          actions.push(
            <button key="approve" className="table-action-btn table-action-btn-success" onClick={() => handleApprove(row.id)} title="Approve">
              Approve
            </button>
          )
        }

        if (canReject(row)) {
          actions.push(
            <button key="reject" className="table-action-btn table-action-btn-danger" onClick={() => openReject(row)} title="Reject">
              Reject
            </button>
          )
        }

        if (row.status === 'approved') {
          actions.push(
            <span key="readonly" className="table-action-readonly">Read Only</span>
          )
        }

        return <div className="table-actions">{actions}</div>
      },
    },
  ]

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Record payment transactions inside active registers.</p>
      </div>

      <Card
        title="Payment History"
        subtitle="All payment records"
        actions={
          <div className="payments-toolbar">
            <Input
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="payments-search"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="payments-filter"
            />
            <Select
              options={activeRegisterOptions}
              value={registerFilter}
              onChange={(e) => setRegisterFilter(e.target.value)}
              className="payments-filter"
              placeholder="All Registers"
            />
            <Select
              options={paymentTypeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="payments-filter"
              placeholder="All Types"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="payments-filter"
            />
            <Button onClick={() => { resetForm(); setShowCreateModal(true) }}>+ New Payment</Button>
          </div>
        }
      >
        <Table columns={columns} data={filtered} emptyText="No payments found. Create your first payment record." />
      </Card>

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); setSelectedPayment(null); }} title={selectedPayment ? 'Edit Payment' : 'New Payment'}>
        <form onSubmit={selectedPayment ? handleUpdateDraft : handleCreate}>
          <FormSection title="Payment Information">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
            <Select
              label="Register"
              options={activeRegisterOptions}
              value={formData.registerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, registerId: e.target.value }))}
              placeholder="Select active register"
              required
            />
            <Select
              label="Type"
              options={paymentTypeOptions}
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
            />
            <Input
              label="Party Name"
              placeholder="Enter party name"
              value={formData.partyName}
              onChange={(e) => setFormData((prev) => ({ ...prev, partyName: e.target.value }))}
              required
            />
            <Input
              label="Reference"
              placeholder="Reference number"
              value={formData.reference}
              onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
            />
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              required
            />
            <Select
              label="Payment Method"
              options={paymentMethodOptions}
              value={formData.paymentMethod}
              onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            />
            <Input
              label="Description"
              placeholder="Brief description (optional)"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
            <Input
              label="Notes"
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </FormSection>
          <div className="modal-form-actions">
            <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); setSelectedPayment(null); }}>Cancel</Button>
            <Button type="submit">{selectedPayment ? 'Update Payment' : 'Save Draft'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showViewModal} onClose={() => { setShowViewModal(false); setSelectedPayment(null); }} title="Payment Details">
        {selectedPayment && (
          <div className="view-details">
            <div className="view-row">
              <span className="view-label">Payment Number</span>
              <span className="view-value">{selectedPayment.paymentNumber}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Date</span>
              <span className="view-value">{selectedPayment.date}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Register</span>
              <span className="view-value">{selectedPayment.register}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Type</span>
              <span className="view-value">{selectedPayment.type}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Party Name</span>
              <span className="view-value">{selectedPayment.partyName}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Reference</span>
              <span className="view-value">{selectedPayment.reference || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Amount</span>
              <span className="view-value">{formatCurrency(selectedPayment.amount)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Payment Method</span>
              <span className="view-value">{selectedPayment.paymentMethod}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Description</span>
              <span className="view-value">{selectedPayment.description || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Notes</span>
              <span className="view-value">{selectedPayment.notes || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Created By</span>
              <span className="view-value">{selectedPayment.createdBy}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Status</span>
              <span className="view-value"><Badge variant={statusVariant(selectedPayment.status)}>{selectedPayment.status}</Badge></span>
            </div>
            {selectedPayment.status === 'rejected' && selectedPayment.rejectionReason && (
              <div className="view-row view-rejection">
                <span className="view-label">Rejection Reason</span>
                <span className="view-value view-rejection-text">{selectedPayment.rejectionReason}</span>
              </div>
            )}
            <div className="modal-form-actions">
              <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedPayment(null); }}>Close</Button>
              {canApprove(selectedPayment) && (
                <Button onClick={() => handleApprove(selectedPayment.id)}>Approve</Button>
              )}
              {canReject(selectedPayment) && (
                <Button variant="danger" onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}>Reject</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason(''); }} title="Reject Payment">
        {selectedPayment && (
          <form onSubmit={handleReject}>
            <p className="reject-info">You are rejecting <strong>{selectedPayment.paymentNumber}</strong> created by <strong>{selectedPayment.createdBy}</strong>.</p>
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
