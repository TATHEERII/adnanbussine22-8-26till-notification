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
import { mockSales, mockRegisters } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { useAuditLog } from '../hooks/useAuditLog'
import './Sales.css'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const paymentStatusOptions = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Unpaid', label: 'Unpaid' },
  { value: 'Partial', label: 'Partial' },
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

const generateSaleNumber = (sales) => {
  const maxNum = sales.reduce((max, s) => {
    const num = parseInt(s.saleNumber.replace('SAL-', ''), 10)
    return num > max ? num : max
  }, 0)
  return `SAL-${String(maxNum + 1).padStart(5, '0')}`
}

export default function Sales() {
  const { currencySymbol } = useSettings()

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const [sales, setSales] = useLocalStorageState('importbiz_v2_sales', mockSales)
  const [registers] = useLocalStorageState('importbiz_v2_registers', mockRegisters)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [registerFilter, setRegisterFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    registerId: '',
    customerName: '',
    description: '',
    amount: '',
    paymentStatus: 'Unpaid',
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
    return sales.filter((s) => {
      const matchesSearch =
        !search ||
        s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.register.toLowerCase().includes(search.toLowerCase())
      const matchesDate = !dateFilter || s.date === dateFilter
      const matchesRegister = !registerFilter || s.registerId === registerFilter
      const matchesStatus = !statusFilter || s.status === statusFilter
      return matchesSearch && matchesDate && matchesRegister && matchesStatus
    })
  }, [sales, search, dateFilter, registerFilter, statusFilter])

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      registerId: '',
      customerName: '',
      description: '',
      amount: '',
      paymentStatus: 'Unpaid',
      notes: '',
    })
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!formData.customerName.trim() || !formData.registerId || !formData.amount) return

    const selectedReg = registers.find((r) => r.id === formData.registerId)
    const newSale = {
      id: `s${Date.now()}`,
      saleNumber: generateSaleNumber(sales),
      date: formData.date,
      register: selectedReg ? selectedReg.name : '',
      registerId: formData.registerId,
      customerName: formData.customerName.trim(),
      description: formData.description.trim(),
      amount: Number(formData.amount) || 0,
      paymentStatus: formData.paymentStatus,
      status: 'draft',
      createdBy: current.name,
      createdById: current.id,
      notes: formData.notes.trim(),
      rejectionReason: '',
    }

    setSales((prev) => [newSale, ...prev])
    addLog({ user: current.name, action: 'Sale Created', module: 'Sales', reference: newSale.saleNumber, register: selectedReg ? selectedReg.name : '', description: `Created sale for ${newSale.customerName}`, oldStatus: '-', newStatus: 'Draft' })
    resetForm()
    setShowCreateModal(false)
  }

  const handleEditDraft = (sale) => {
    setSelectedSale(sale)
    setFormData({
      date: sale.date,
      registerId: sale.registerId,
      customerName: sale.customerName,
      description: sale.description,
      amount: String(sale.amount || 0),
      paymentStatus: sale.paymentStatus,
      notes: sale.notes || '',
    })
    setShowCreateModal(true)
  }

  const handleUpdateDraft = (e) => {
    e.preventDefault()
    if (!selectedSale || !formData.customerName.trim() || !formData.registerId || !formData.amount) return

    const selectedReg = registers.find((r) => r.id === formData.registerId)
    setSales((prev) =>
      prev.map((s) =>
        s.id === selectedSale.id
          ? {
              ...s,
              date: formData.date,
              register: selectedReg ? selectedReg.name : '',
              registerId: formData.registerId,
              customerName: formData.customerName.trim(),
              description: formData.description.trim(),
              amount: Number(formData.amount) || 0,
              paymentStatus: formData.paymentStatus,
              notes: formData.notes.trim(),
            }
          : s
      )
    )
    resetForm()
    setSelectedSale(null)
    setShowCreateModal(false)
  }

  const handleSubmit = (saleId) => {
    const sale = sales.find((s) => s.id === saleId)
    if (!sale) return
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId ? { ...s, status: 'pending' } : s
      )
    )
    addLog({ user: current.name, action: 'Sale Submitted', module: 'Sales', reference: sale.saleNumber, register: sale.register, description: 'Submitted sale for approval', oldStatus: 'Draft', newStatus: 'Pending Approval' })
  }

  const handleApprove = (saleId) => {
    const sale = sales.find((s) => s.id === saleId)
    if (!sale) return
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId ? { ...s, status: 'approved', rejectionReason: '' } : s
      )
    )
    addLog({ user: current.name, action: 'Sale Approved', module: 'Sales', reference: sale.saleNumber, register: sale.register, description: 'Approved sale record', oldStatus: 'Pending Approval', newStatus: 'Approved' })
    setShowViewModal(false)
    setSelectedSale(null)
  }

  const handleReject = (e) => {
    e.preventDefault()
    if (!selectedSale || !rejectionReason.trim()) return

    setSales((prev) =>
      prev.map((s) =>
        s.id === selectedSale.id
          ? { ...s, status: 'rejected', rejectionReason: rejectionReason.trim() }
          : s
      )
    )
    addLog({ user: current.name, action: 'Sale Rejected', module: 'Sales', reference: selectedSale.saleNumber, register: selectedSale.register, description: 'Rejected sale record', oldStatus: 'Pending Approval', newStatus: 'Rejected' })
    setRejectionReason('')
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedSale(null)
  }

  const openView = (sale) => {
    setSelectedSale(sale)
    setShowViewModal(true)
  }

  const openReject = (sale) => {
    setSelectedSale(sale)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const canApprove = (sale) => {
    if (sale.status !== 'pending') return false
    if (sale.createdById === current.id) return false
    return true
  }

  const canReject = (sale) => {
    if (sale.status !== 'pending') return false
    if (sale.createdById === current.id) return false
    return true
  }

  const isOwner = (sale) => sale.createdById === current.id

  const columns = [
    { key: 'saleNumber', label: 'Sale No.' },
    { key: 'date', label: 'Date' },
    { key: 'register', label: 'Register' },
    { key: 'customerName', label: 'Customer / Party' },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="table-amount">{formatCurrency(val)}</span>,
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (val) => <Badge variant={val === 'Paid' ? 'success' : val === 'Partial' ? 'warning' : 'default'}>{val}</Badge>,
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
    <div className="sales-page">
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
        <p className="page-subtitle">Record sales transactions inside active registers.</p>
      </div>

      <Card
        title="Sales History"
        subtitle="All sales records"
        actions={
          <div className="sales-toolbar">
            <Input
              placeholder="Search sales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sales-search"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="sales-filter"
            />
            <Select
              options={activeRegisterOptions}
              value={registerFilter}
              onChange={(e) => setRegisterFilter(e.target.value)}
              className="sales-filter"
              placeholder="All Registers"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sales-filter"
            />
            <Button onClick={() => { resetForm(); setShowCreateModal(true) }}>+ New Sale</Button>
          </div>
        }
      >
        <Table columns={columns} data={filtered} emptyText="No sales found. Create your first sale record." />
      </Card>

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); setSelectedSale(null); }} title={selectedSale ? 'Edit Sale' : 'New Sale'}>
        <form onSubmit={selectedSale ? handleUpdateDraft : handleCreate}>
          <FormSection title="Sale Information">
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
              label="Customer / Party Name"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
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
            <Select
              label="Payment Status"
              options={paymentStatusOptions}
              value={formData.paymentStatus}
              onChange={(e) => setFormData((prev) => ({ ...prev, paymentStatus: e.target.value }))}
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
            <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); setSelectedSale(null); }}>Cancel</Button>
            <Button type="submit">{selectedSale ? 'Update Sale' : 'Save Draft'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showViewModal} onClose={() => { setShowViewModal(false); setSelectedSale(null); }} title="Sale Details">
        {selectedSale && (
          <div className="view-details">
            <div className="view-row">
              <span className="view-label">Sale Number</span>
              <span className="view-value">{selectedSale.saleNumber}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Date</span>
              <span className="view-value">{selectedSale.date}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Register</span>
              <span className="view-value">{selectedSale.register}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Customer / Party</span>
              <span className="view-value">{selectedSale.customerName}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Amount</span>
              <span className="view-value">{formatCurrency(selectedSale.amount)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Payment Status</span>
              <span className="view-value">{selectedSale.paymentStatus}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Description</span>
              <span className="view-value">{selectedSale.description || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Notes</span>
              <span className="view-value">{selectedSale.notes || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Created By</span>
              <span className="view-value">{selectedSale.createdBy}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Status</span>
              <span className="view-value"><Badge variant={statusVariant(selectedSale.status)}>{selectedSale.status}</Badge></span>
            </div>
            {selectedSale.status === 'rejected' && selectedSale.rejectionReason && (
              <div className="view-row view-rejection">
                <span className="view-label">Rejection Reason</span>
                <span className="view-value view-rejection-text">{selectedSale.rejectionReason}</span>
              </div>
            )}
            <div className="modal-form-actions">
              <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedSale(null); }}>Close</Button>
              {canApprove(selectedSale) && (
                <Button onClick={() => handleApprove(selectedSale.id)}>Approve</Button>
              )}
              {canReject(selectedSale) && (
                <Button variant="danger" onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}>Reject</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason(''); }} title="Reject Sale">
        {selectedSale && (
          <form onSubmit={handleReject}>
            <p className="reject-info">You are rejecting <strong>{selectedSale.saleNumber}</strong> created by <strong>{selectedSale.createdBy}</strong>.</p>
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
