import { useState, useMemo } from 'react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import { mockUsers } from '../data/mockData'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import './AdminUsers.css'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
]

const permissionOptions = [
  { key: 'canCreateRegister', label: 'Can Create Register' },
  { key: 'canCreatePurchase', label: 'Can Create Purchase' },
  { key: 'canCreateSale', label: 'Can Create Sale' },
  { key: 'canCreateExpense', label: 'Can Create Expense' },
  { key: 'canCreatePayment', label: 'Can Create Payment' },
  { key: 'canApprove', label: 'Can Approve Requests' },
  { key: 'canViewReports', label: 'Can View Reports' },
  { key: 'canViewAuditLog', label: 'Can View Audit Log' },
]

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminUsers() {
  const [users, setUsers] = useLocalStorageState('importbiz_v2_users', mockUsers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || u.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [users, search, statusFilter])

  const openDetails = (user) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const openPermissions = (user) => {
    setSelectedUser(user)
    setShowPermissionsModal(true)
  }

  const toggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    )
  }

  const updatePermissions = (userId, permissions) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, permissions } : u
      )
    )
    setShowPermissionsModal(false)
    setSelectedUser(null)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username', render: (val) => <span className="admin-username">{val}</span> },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => <Badge variant={val === 'admin' ? 'warning' : 'default'}>{val}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={val === 'active' ? 'success' : 'danger'}>{val}</Badge>,
    },
    { key: 'registerCount', label: 'Registers', render: (val) => <span className="admin-register-count">{val}</span> },
    { key: 'createdAt', label: 'Created Date', render: (val) => formatDate(val) },
    { key: 'lastActivity', label: 'Last Activity', render: (val) => formatDate(val) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="admin-actions">
          <button className="table-action-btn" onClick={() => openDetails(row)} title="View Details">
            View
          </button>
          <button className="table-action-btn" onClick={() => openPermissions(row)} title="Manage Permissions">
            Permissions
          </button>
          {row.role !== 'admin' && (
            <button
              className={`table-action-btn ${row.status === 'active' ? 'table-action-btn-danger' : 'table-action-btn-success'}`}
              onClick={() => toggleStatus(row.id)}
              title={row.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              {row.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      ),
    },
  ]

  const getUserPermissions = (user) => {
    return user.permissions || {
      canCreateRegister: true,
      canCreatePurchase: true,
      canCreateSale: true,
      canCreateExpense: true,
      canCreatePayment: true,
      canApprove: user.role !== 'admin',
      canViewReports: true,
      canViewAuditLog: true,
    }
  }

  const renderDetailsModal = () => {
    if (!selectedUser) return null
    const permissions = getUserPermissions(selectedUser)

    return (
      <Modal open={showDetailsModal} onClose={() => { setShowDetailsModal(false); setSelectedUser(null); }} title="User Details">
        <div className="view-details">
          <div className="view-row">
            <span className="view-label">Name</span>
            <span className="view-value">{selectedUser.name}</span>
          </div>
          <div className="view-row">
            <span className="view-label">Username</span>
            <span className="view-value">{selectedUser.username}</span>
          </div>
          <div className="view-row">
            <span className="view-label">Email</span>
            <span className="view-value">{selectedUser.email}</span>
          </div>
          <div className="view-row">
            <span className="view-label">Role</span>
            <span className="view-value"><Badge variant={selectedUser.role === 'admin' ? 'warning' : 'default'}>{selectedUser.role}</Badge></span>
          </div>
          <div className="view-row">
            <span className="view-label">Status</span>
            <span className="view-value"><Badge variant={selectedUser.status === 'active' ? 'success' : 'danger'}>{selectedUser.status}</Badge></span>
          </div>
          <div className="view-row">
            <span className="view-label">Registers</span>
            <span className="view-value">{selectedUser.registerCount}</span>
          </div>
          <div className="view-row">
            <span className="view-label">Created Date</span>
            <span className="view-value">{formatDate(selectedUser.createdAt)}</span>
          </div>
          <div className="view-row">
            <span className="view-label">Last Activity</span>
            <span className="view-value">{formatDate(selectedUser.lastActivity)}</span>
          </div>
          <div className="view-row">
            <span className="view-label">Permissions</span>
            <span className="view-value">
              <div className="permissions-list">
                {Object.entries(permissions).map(([key, value]) => (
                  <div key={key} className={`permission-item ${value ? 'permission-granted' : 'permission-denied'}`}>
                    {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}: {value ? 'Yes' : 'No'}
                  </div>
                ))}
              </div>
            </span>
          </div>
        </div>
        <div className="modal-form-actions">
          <Button variant="secondary" onClick={() => { setShowDetailsModal(false); setSelectedUser(null); }}>Close</Button>
          {selectedUser.role !== 'admin' && (
            <Button variant="danger" onClick={() => { toggleStatus(selectedUser.id); setShowDetailsModal(false); setSelectedUser(null); }}>
              {selectedUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
            </Button>
          )}
        </div>
      </Modal>
    )
  }

  const renderPermissionsModal = () => {
    if (!selectedUser) return null

    return (
      <Modal open={showPermissionsModal} onClose={() => { setShowPermissionsModal(false); setSelectedUser(null); }} title="Manage Permissions">
        <div className="permissions-modal">
          <p className="permissions-info">
            Manage permissions for <strong>{selectedUser.name}</strong>.
          </p>
          <div className="permissions-grid">
            {permissionOptions.map((perm) => (
              <label key={perm.key} className="permission-checkbox">
                <input
                  type="checkbox"
                  defaultChecked={getUserPermissions(selectedUser)[perm.key]}
                  onChange={(e) => {
                    const newPerms = { ...getUserPermissions(selectedUser), [perm.key]: e.target.checked }
                    selectedUser.permissions = newPerms
                  }}
                />
                <span>{perm.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-form-actions">
          <Button variant="secondary" onClick={() => { setShowPermissionsModal(false); setSelectedUser(null); }}>Cancel</Button>
          <Button
            onClick={() => {
              const checkboxes = document.querySelectorAll('.permission-checkbox input[type="checkbox"]')
              const newPerms = {}
              checkboxes.forEach((cb, index) => {
                newPerms[permissionOptions[index].key] = cb.checked
              })
              updatePermissions(selectedUser.id, newPerms)
            }}
          >
            Save Permissions
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Admin / Users</h1>
        <p className="page-subtitle">Manage users and monitor system activity.</p>
      </div>

      <Card
        title="Users"
        subtitle={`${filtered.length} user${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <div className="admin-toolbar">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-filter"
              placeholder="All Statuses"
            />
          </div>
        }
      >
        <Table columns={columns} data={filtered} emptyText="No users found." />
      </Card>

      {renderDetailsModal()}
      {renderPermissionsModal()}
    </div>
  )
}
