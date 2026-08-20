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
import { mockPurchases, mockRegisters } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import './Purchase.css'

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

const generatePurchaseNumber = (purchases) => {
  const maxNum = purchases.reduce((max, p) => {
    const num = parseInt(p.purchaseNumber.replace('PUR-', ''), 10)
    return num > max ? num : max
  }, 0)
  return `PUR-${String(maxNum + 1).padStart(5, '0')}`
}

export default function Purchase() {
  const { currencySymbol } = useSettings()

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const [purchases, setPurchases] = useLocalStorageState('importbiz_v2_purchases', mockPurchases)
  const [registers] = useLocalStorageState('importbiz_v2_registers', mockRegisters)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [registerFilter, setRegisterFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    registerId: '',
    supplierName: '',
    description: '',
    amount: '',
    notes: '',
  })

  const current = useAuth()

  const activeRegisters = useMemo(() => {
    return registers.filter((r) => r.status === 'active')
  }, [registers])

  const activeRegisterOptions = activeRegisters.map((r) => ({
    value: r.id,
    label: r.name,
  }))

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        !search ||
        p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.register.toLowerCase().includes(search.toLowerCase())
      const matchesDate = !dateFilter || p.date === dateFilter
      const matchesRegister = !registerFilter || p.registerId === registerFilter
      const matchesStatus = !statusFilter || p.status === statusFilter
      return matchesSearch && matchesDate && matchesRegister && matchesStatus
    })
  }, [purchases, search, dateFilter, registerFilter, statusFilter])

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      registerId: '',
      supplierName: '',
      description: '',
      amount: '',
      notes: '',
    })
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!formData.supplierName.trim() || !formData.registerId || !formData.amount) return

    const selectedReg = registers.find((r) => r.id === formData.registerId)
    const newPurchase = {
      id: `p${Date.now()}`,
      purchaseNumber: generatePurchaseNumber(purchases),
      date: formData.date,
      register: selectedReg ? selectedReg.name : '',
      registerId: formData.registerId,
      supplierName: formData.supplierName.trim(),
      description: formData.description.trim(),
      amount: Number(formData.amount) || 0,
      status: 'draft',
      createdBy: current.name,
      createdById: current.id,
      notes: formData.notes.trim(),
      rejectionReason: '',
    }

    setPurchases((prev) => [newPurchase, ...prev])
    resetForm()
    setShowCreateModal(false)
  }

  const handleEditDraft = (purchase) => {
    setSelectedPurchase(purchase)
    setFormData({
      date: purchase.date,
      registerId: purchase.registerId,
      supplierName: purchase.supplierName,
      description: purchase.description,
      amount: String(purchase.amount || 0),
      notes: purchase.notes || '',
    })
    setShowCreateModal(true)
  }

  const handleUpdateDraft = (e) => {
    e.preventDefault()
    if (!selectedPurchase || !formData.supplierName.trim() || !formData.registerId || !formData.amount) return

    const selectedReg = registers.find((r) => r.id === formData.registerId)
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === selectedPurchase.id
          ? {
              ...p,
              date: formData.date,
              register: selectedReg ? selectedReg.name : '',
              registerId: formData.registerId,
              supplierName: formData.supplierName.trim(),
              description: formData.description.trim(),
              amount: Number(formData.amount) || 0,
              notes: formData.notes.trim(),
            }
          : p
      )
    )
    resetForm()
    setSelectedPurchase(null)
    setShowCreateModal(false)
  }

  const handleSubmit = (purchaseId) => {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId ? { ...p, status: 'pending' } : p
      )
    )
  }

  const handleApprove = (purchaseId) => {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId ? { ...p, status: 'approved', rejectionReason: '' } : p
      )
    )
    setShowViewModal(false)
    setSelectedPurchase(null)
  }

  const handleReject = (e) => {
    e.preventDefault()
    if (!selectedPurchase || !rejectionReason.trim()) return

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === selectedPurchase.id
          ? { ...p, status: 'rejected', rejectionReason: rejectionReason.trim() }
          : p
      )
    )
    setRejectionReason('')
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedPurchase(null)
  }

  const openView = (purchase) => {
    setSelectedPurchase(purchase)
    setShowViewModal(true)
  }

  const openReject = (purchase) => {
    setSelectedPurchase(purchase)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const canApprove = (purchase) => {
    if (purchase.status !== 'pending') return false
    if (purchase.createdById === current.id) return false
    return true
  }

  const canReject = (purchase) => {
    if (purchase.status !== 'pending') return false
    if (purchase.createdById === current.id) return false
    return true
  }

  const isOwner = (purchase) => purchase.createdById === current.id

  const columns = [
    { key: 'purchaseNumber', label: 'Purchase No.' },
    { key: 'date', label: 'Date' },
    { key: 'register', label: 'Register' },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="table-amount">{formatCurrency(val)}</span>,
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
    <div className="purchase-page">
      <div className="page-header">
        <h1 className="page-title">Purchase</h1>
        <p className="page-subtitle">Record purchase transactions inside active registers.</p>
      </div>

      <Card
        title="Purchase History"
        subtitle="All purchase records"
        actions={
          <div className="purchase-toolbar">
            <Input
              placeholder="Search purchases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="purchase-search"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="purchase-filter"
            />
            <Select
              options={activeRegisterOptions}
              value={registerFilter}
              onChange={(e) => setRegisterFilter(e.target.value)}
              className="purchase-filter"
              placeholder="All Registers"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="purchase-filter"
            />
            <Button onClick={() => { resetForm(); setShowCreateModal(true) }}>+ New Purchase</Button>
          </div>
        }
      >
        <Table columns={columns} data={filtered} emptyText="No purchases found. Create your first purchase record." />
      </Card>

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); setSelectedPurchase(null); }} title={selectedPurchase ? 'Edit Purchase' : 'New Purchase'}>
        <form onSubmit={selectedPurchase ? handleUpdateDraft : handleCreate}>
          <FormSection title="Purchase Information">
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
            <Input
              label="Supplier / Vendor Name"
              placeholder="Enter supplier name"
              value={formData.supplierName}
              onChange={(e) => setFormData((prev) => ({ ...prev, supplierName: e.target.value }))}
              required
            />
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              required
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
            <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); setSelectedPurchase(null); }}>Cancel</Button>
            <Button type="submit">{selectedPurchase ? 'Update Purchase' : 'Save Draft'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showViewModal} onClose={() => { setShowViewModal(false); setSelectedPurchase(null); }} title="Purchase Details">
        {selectedPurchase && (
          <div className="view-details">
            <div className="view-row">
              <span className="view-label">Purchase Number</span>
              <span className="view-value">{selectedPurchase.purchaseNumber}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Date</span>
              <span className="view-value">{selectedPurchase.date}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Register</span>
              <span className="view-value">{selectedPurchase.register}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Supplier</span>
              <span className="view-value">{selectedPurchase.supplierName}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Amount</span>
              <span className="view-value">{formatCurrency(selectedPurchase.amount)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Description</span>
              <span className="view-value">{selectedPurchase.description || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Notes</span>
              <span className="view-value">{selectedPurchase.notes || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Created By</span>
              <span className="view-value">{selectedPurchase.createdBy}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Status</span>
              <span className="view-value"><Badge variant={statusVariant(selectedPurchase.status)}>{selectedPurchase.status}</Badge></span>
            </div>
            {selectedPurchase.status === 'rejected' && selectedPurchase.rejectionReason && (
              <div className="view-row view-rejection">
                <span className="view-label">Rejection Reason</span>
                <span className="view-value view-rejection-text">{selectedPurchase.rejectionReason}</span>
              </div>
            )}
            <div className="modal-form-actions">
              <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedPurchase(null); }}>Close</Button>
              {canApprove(selectedPurchase) && (
                <Button onClick={() => handleApprove(selectedPurchase.id)}>Approve</Button>
              )}
              {canReject(selectedPurchase) && (
                <Button variant="danger" onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}>Reject</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason(''); }} title="Reject Purchase">
        {selectedPurchase && (
          <form onSubmit={handleReject}>
            <p className="reject-info">You are rejecting <strong>{selectedPurchase.purchaseNumber}</strong> created by <strong>{selectedPurchase.createdBy}</strong>.</p>
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
