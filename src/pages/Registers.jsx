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
import './Registers.css'

const registerTypes = [
  { value: 'Import', label: 'Import' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Expense', label: 'Expense' },
  { value: 'General', label: 'General' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'active', label: 'Active' },
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

export default function Registers() {
  const { currencySymbol } = useSettings()

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const { registers, createRegister, updateRegister, approveItem, rejectItem } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRegister, setSelectedRegister] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    type: 'Import',
    openingBalance: '',
    description: '',
  })

  const current = useAuth()

  const filtered = useMemo(() => {
    return registers.filter((r) => {
      const matchesSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.owner.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [registers, search, statusFilter])

  const resetForm = () => {
    setFormData({ name: '', type: 'Import', openingBalance: '', description: '' })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const newRegister = {
      name: formData.name.trim(),
      type: formData.type,
      openingBalance: Number(formData.openingBalance) || 0,
      description: formData.description.trim(),
      status: 'draft',
    }

    try {
      await createRegister(newRegister)
      resetForm()
      setShowCreateModal(false)
    } catch (err) {
      alert(err.message || 'Failed to create register')
    }
  }

  const handleEditDraft = (register) => {
    setSelectedRegister(register)
    setFormData({
      name: register.name,
      type: register.type,
      openingBalance: String(register.openingBalance || 0),
      description: register.description || '',
    })
    setShowCreateModal(true)
  }

  const handleUpdateDraft = async (e) => {
    e.preventDefault()
    if (!selectedRegister || !formData.name.trim()) return

    try {
      await updateRegister(selectedRegister.id, {
        name: formData.name.trim(),
        type: formData.type,
        openingBalance: Number(formData.openingBalance) || 0,
        description: formData.description.trim(),
      })

      // If this was a rejected register, resubmit it for approval after updating.
      if (selectedRegister.status === 'rejected') {
        await updateRegister(selectedRegister.id, { status: 'pending' })
      }

      resetForm()
      setSelectedRegister(null)
      setShowCreateModal(false)
    } catch (err) {
      alert(err.message || 'Failed to update register')
    }
  }

  const handleSubmit = async (registerId) => {
    try {
      await updateRegister(registerId, { status: 'pending' })
    } catch (err) {
      alert(err.message || 'Failed to submit register')
    }
  }

  const handleApprove = async (registerId) => {
    try {
      await approveItem('register', registerId)
      setShowViewModal(false)
      setSelectedRegister(null)
    } catch (err) {
      alert(err.message || 'Failed to approve register')
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!selectedRegister || !rejectionReason.trim()) return

    try {
      await rejectItem('register', selectedRegister.id, rejectionReason.trim())
      setRejectionReason('')
      setShowRejectModal(false)
      setShowViewModal(false)
      setSelectedRegister(null)
    } catch (err) {
      alert(err.message || 'Failed to reject register')
    }
  }

  const openView = (register) => {
    setSelectedRegister(register)
    setShowViewModal(true)
  }

  const openReject = (register) => {
    setSelectedRegister(register)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const canApprove = (register) => {
    if (register.status !== 'pending') return false
    if (register.ownerId === current.id) return false
    return true
  }

  const canReject = (register) => {
    if (register.status !== 'pending') return false
    if (register.ownerId === current.id) return false
    return true
  }

  const isOwner = (register) => register.ownerId === current.id

  const columns = [
    { key: 'name', label: 'Register Name' },
    { key: 'owner', label: 'Owner' },
    { key: 'type', label: 'Type', render: (val) => <Badge variant="info">{val}</Badge> },
    { key: 'openingBalance', label: 'Opening Balance', render: (val) => <span className="table-amount">{formatCurrency(val)}</span> },
    { key: 'createdDate', label: 'Created Date' },
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

        if (row.status === 'active') {
          actions.push(
            <span key="readonly" className="table-action-readonly">Read Only</span>
          )
        }

        return <div className="table-actions">{actions}</div>
      },
    },
  ]

  return (
    <div className="registers-page">
      <div className="page-header">
        <h1 className="page-title">Registers / Ledgers</h1>
        <p className="page-subtitle">Create and manage business registers.</p>
      </div>

      <div className="registers-filter-bar">
        <Input
          placeholder="Search registers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="registers-search"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="registers-filter"
        />
        <Button onClick={() => { resetForm(); setShowCreateModal(true) }}>+ New Register</Button>
      </div>

      <div className="registers-content">
        <div className="registers-content-header">
          <h2 className="registers-content-title">Registers</h2>
          <span className="registers-content-subtitle">Manage your business registers</span>
        </div>
        <Table columns={columns} data={filtered} emptyText="No registers found. Create your first register to get started." cardViewOnMobile />
      </div>
      <FAB onClick={() => { resetForm(); setShowCreateModal(true) }} label="+" />

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); setSelectedRegister(null); }} title={selectedRegister ? 'Edit Register' : 'Create New Register'}>
        <form onSubmit={selectedRegister ? handleUpdateDraft : handleCreate}>
          <FormSection title="Register Information">
            <Input
              label="Register Name"
              placeholder="Enter register name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Select
              label="Register Type"
              options={registerTypes}
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
            />
            <Input
              label="Opening Balance"
              type="number"
              placeholder="0.00"
              value={formData.openingBalance}
              onChange={(e) => setFormData((prev) => ({ ...prev, openingBalance: e.target.value }))}
            />
            <Input
              label="Description"
              placeholder="Brief description (optional)"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </FormSection>
          <div className="modal-form-actions">
            <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); setSelectedRegister(null); }}>Cancel</Button>
            <Button type="submit">{selectedRegister ? 'Update Register' : 'Create Register'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showViewModal} onClose={() => { setShowViewModal(false); setSelectedRegister(null); }} title="Register Details">
        {selectedRegister && (
          <div className="view-details">
            <div className="view-row">
              <span className="view-label">Register Name</span>
              <span className="view-value">{selectedRegister.name}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Owner</span>
              <span className="view-value">{selectedRegister.owner}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Type</span>
              <span className="view-value">{selectedRegister.type}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Opening Balance</span>
              <span className="view-value">{formatCurrency(selectedRegister.openingBalance)}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Created Date</span>
              <span className="view-value">{selectedRegister.createdDate}</span>
            </div>
            <div className="view-row">
              <span className="view-label">Status</span>
              <span className="view-value"><Badge variant={statusVariant(selectedRegister.status)}>{selectedRegister.status}</Badge></span>
            </div>
            <div className="view-row">
              <span className="view-label">Description</span>
              <span className="view-value">{selectedRegister.description || '-'}</span>
            </div>
            {selectedRegister.status === 'rejected' && selectedRegister.rejectionReason && (
              <div className="view-row view-rejection">
                <span className="view-label">Rejection Reason</span>
                <span className="view-value view-rejection-text">{selectedRegister.rejectionReason}</span>
              </div>
            )}
            <div className="modal-form-actions">
              <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedRegister(null); }}>Close</Button>
              {canApprove(selectedRegister) && (
                <Button onClick={() => handleApprove(selectedRegister.id)}>Approve</Button>
              )}
              {canReject(selectedRegister) && (
                <Button variant="danger" onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}>Reject</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason(''); }} title="Reject Register">
        {selectedRegister && (
          <form onSubmit={handleReject}>
            <p className="reject-info">You are rejecting <strong>{selectedRegister.name}</strong> created by <strong>{selectedRegister.owner}</strong>.</p>
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
