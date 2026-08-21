import { useState, useMemo } from 'react'
import { useSettings } from '../context/SettingsContext'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import FormLayout, { FormSection } from '../components/ui/FormLayout'
import Table from '../components/ui/Table'
import FAB from '../components/ui/FAB'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import './Expenses.css'

const expenseCategories = [
  { value: 'Transport', label: 'Transport' },
  { value: 'Office', label: 'Office' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'Customs', label: 'Customs' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Other', label: 'Other' },
]

const paidThroughOptions = [
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

const generateExpenseNumber = (expenses) => {
  const maxNum = expenses.reduce((max, e) => {
    const num = parseInt(e.expenseNumber.replace('EXP-', ''), 10)
    return num > max ? num : max
  }, 0)
  return `EXP-${String(maxNum + 1).padStart(5, '0')}`
}

export default function Expenses() {
  const { currencySymbol } = useSettings()

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const { expenses, createExpense, updateExpense, approveItem, rejectItem, registers } = useData()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [registerFilter, setRegisterFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    registerId: '',
    category: 'Transport',
    description: '',
    amount: '',
    paidThrough: 'Cash',
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
    return expenses.filter((e) => {
      const matchesSearch =
        !search ||
        e.expenseNumber.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.register.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
      const matchesDate = !dateFilter || e.date === dateFilter
      const matchesCategory = !categoryFilter || e.category === categoryFilter
      const matchesRegister = !registerFilter || e.registerId === registerFilter
      const matchesStatus = !statusFilter || e.status === statusFilter
      return matchesSearch && matchesDate && matchesCategory && matchesRegister && matchesStatus
    })
  }, [expenses, search, dateFilter, categoryFilter, registerFilter, statusFilter])

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      registerId: '',
      category: 'Transport',
      description: '',
      amount: '',
      paidThrough: 'Cash',
      notes: '',
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.description.trim() || !formData.registerId || !formData.amount) return

    const newExpense = {
      expenseNumber: generateExpenseNumber(expenses),
      date: formData.date,
      registerId: formData.registerId,
      category: formData.category,
      description: formData.description.trim(),
      amount: Number(formData.amount) || 0,
      paidThrough: formData.paidThrough,
      notes: formData.notes.trim(),
      status: 'draft',
    }

    try {
      await createExpense(newExpense)
      resetForm()
      setShowCreateModal(false)
    } catch (err) {
      alert(err.message || 'Failed to create expense')
    }
  }

  const handleEditDraft = (expense) => {
    setSelectedExpense(expense)
    setFormData({
      date: expense.date,
      registerId: expense.registerId,
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount || 0),
      paidThrough: expense.paidThrough,
      notes: expense.notes || '',
    })
    setShowCreateModal(true)
  }

  const handleUpdateDraft = async (e) => {
    e.preventDefault()
    if (!selectedExpense || !formData.description.trim() || !formData.registerId || !formData.amount) return

    try {
      await updateExpense(selectedExpense.id, {
        expenseNumber: selectedExpense.expenseNumber,
        date: formData.date,
        registerId: formData.registerId,
        category: formData.category,
        description: formData.description.trim(),
        amount: Number(formData.amount) || 0,
        paidThrough: formData.paidThrough,
        notes: formData.notes.trim(),
      })
      resetForm()
      setSelectedExpense(null)
      setShowCreateModal(false)
    } catch (err) {
      alert(err.message || 'Failed to update expense')
    }
  }

  const handleSubmit = async (expenseId) => {
    try {
      await updateExpense(expenseId, { status: 'pending' })
    } catch (err) {
      alert(err.message || 'Failed to submit expense')
    }
  }

  const handleApprove = async (expenseId) => {
    try {
      await approveItem('expense', expenseId)
      setShowViewModal(false)
      setSelectedExpense(null)
    } catch (err) {
      alert(err.message || 'Failed to approve expense')
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!selectedExpense || !rejectionReason.trim()) return

    try {
      await rejectItem('expense', selectedExpense.id, rejectionReason.trim())
      setRejectionReason('')
      setShowRejectModal(false)
      setShowViewModal(false)
      setSelectedExpense(null)
    } catch (err) {
      alert(err.message || 'Failed to reject expense')
    }
  }

  const openView = (expense) => {
    setSelectedExpense(expense)
    setShowViewModal(true)
  }

  const openReject = (expense) => {
    setSelectedExpense(expense)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const canApprove = (expense) => {
    if (expense.status !== 'pending') return false
    if (expense.createdById === current.id) return false
    return true
  }

  const canReject = (expense) => {
    if (expense.status !== 'pending') return false
    if (expense.createdById === current.id) return false
    return true
  }

  const isOwner = (expense) => expense.createdById === current.id

  const columns = [
    { key: 'expenseNumber', label: 'Expense No.' },
    { key: 'date', label: 'Date' },
    { key: 'register', label: 'Register' },
    { key: 'category', label: 'Category', render: (val) => <Badge variant="info">{val}</Badge> },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="table-amount">{formatCurrency(val)}</span>,
    },
    {
      key: 'paidThrough',
      label: 'Paid Through',
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
    <div className="expenses-page">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">Record and track business expenses inside active registers.</p>
      </div>

      <div className="expenses-filter-bar">
        <Input
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="expenses-search"
        />
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="expenses-filter"
        />
        <Select
          options={expenseCategories.filter((c) => c.value)}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="expenses-filter"
          placeholder="All Categories"
        />
        <Select
          options={activeRegisterOptions}
          value={registerFilter}
          onChange={(e) => setRegisterFilter(e.target.value)}
          className="expenses-filter"
          placeholder="All Registers"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="expenses-filter"
        />
        <Button onClick={() => { resetForm(); setShowCreateModal(true) }}>+ New Expense</Button>
      </div>

      <div className="expenses-content">
        <div className="expenses-content-header">
          <h2 className="expenses-content-title">Expense History</h2>
          <span className="expenses-content-subtitle">All expense records</span>
        </div>
        <Table columns={columns} data={filtered} emptyText="No expenses found. Create your first expense record." cardViewOnMobile />
      </div>
      <FAB onClick={() => { resetForm(); setShowCreateModal(true) }} label="+" />

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); setSelectedExpense(null); }} title={selectedExpense ? 'Edit Expense' : 'New Expense'}>
        <form onSubmit={selectedExpense ? handleUpdateDraft : handleCreate}>
          <FormSection title="Expense Information">
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
              label="Expense Category"
              options={expenseCategories}
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            />
            <Input
              label="Description"
              placeholder="Brief description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
              label="Paid Through"
              options={paidThroughOptions}
              value={formData.paidThrough}
              onChange={(e) => setFormData((prev) => ({ ...prev, paidThrough: e.target.value }))}
            />
            <Input
              label="Notes"
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </FormSection>
          <div className="modal-form-actions">
            <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); setSelectedExpense(null); }}>Cancel</Button>
            <Button type="submit">{selectedExpense ? 'Update Expense' : 'Save Draft'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showViewModal} onClose={() => { setShowViewModal(false); setSelectedExpense(null); }} title="Expense Details">
        {selectedExpense && (
          <div className="view-details">
            <div className="view-row">
              <span className="view-label">Expense Number</span>
              <span className="view-value">{selectedExpense.expenseNumber}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Date</span>
              <span className="view-value">{selectedExpense.date}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Register</span>
              <span className="view-value">{selectedExpense.register}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Category</span>
              <span className="view-value">{selectedExpense.category}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Description</span>
              <span className="view-value">{selectedExpense.description}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Amount</span>
              <span className="view-value">{formatCurrency(selectedExpense.amount)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Paid Through</span>
              <span className="view-value">{selectedExpense.paidThrough}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Notes</span>
              <span className="view-value">{selectedExpense.notes || '-'}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Created By</span>
              <span className="view-value">{selectedExpense.createdBy}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Status</span>
              <span className="view-value"><Badge variant={statusVariant(selectedExpense.status)}>{selectedExpense.status}</Badge></span>
            </div>
            {selectedExpense.status === 'rejected' && selectedExpense.rejectionReason && (
              <div className="view-row view-rejection">
                <span className="view-label">Rejection Reason</span>
                <span className="view-value view-rejection-text">{selectedExpense.rejectionReason}</span>
              </div>
            )}
            <div className="modal-form-actions">
              <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedExpense(null); }}>Close</Button>
              {canApprove(selectedExpense) && (
                <Button onClick={() => handleApprove(selectedExpense.id)}>Approve</Button>
              )}
              {canReject(selectedExpense) && (
                <Button variant="danger" onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}>Reject</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason(''); }} title="Reject Expense">
        {selectedExpense && (
          <form onSubmit={handleReject}>
            <p className="reject-info">You are rejecting <strong>{selectedExpense.expenseNumber}</strong> created by <strong>{selectedExpense.createdBy}</strong>.</p>
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
