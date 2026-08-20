import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import FormLayout, { FormSection } from '../components/ui/FormLayout'
import Table from '../components/ui/Table'
import { mockUsers } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
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
  const current = useAuth()
  if (current?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const [users, setUsers] = useLocalStorageState('importbiz_v2_users', mockUsers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    permissions: {
      canCreateRegister: false,
      canCreatePurchase: false,
      canCreateSale: false,
      canCreateExpense: false,
      canCreatePayment: false,
      canApprove: false,
      canViewReports: false,
      canViewAuditLog: false,
    },
  })

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

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active',
      permissions: {
        canCreateRegister: false,
        canCreatePurchase: false,
        canCreateSale: false,
        canCreateExpense: false,
        canCreatePayment: false,
        canApprove: false,
        canViewReports: false,
        canViewAuditLog: false,
      },
    })
  }

  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!createForm.name.trim() || !createForm.username.trim() || !createForm.email.trim() || !createForm.password.trim()) return

    const today = new Date().toISOString().split('T')[0]
    const newUser = {
      id: `u${Date.now()}`,
      name: createForm.name.trim(),
      username: createForm.username.trim(),
      email: createForm.email.trim(),
      password: createForm.password.trim(),
      role: createForm.role,
      status: createForm.status,
      createdAt: today,
      lastActivity: today,
      registerCount: 0,
      permissions: { ...createForm.permissions },
    }

    setUsers((prev) => [...prev, newUser])
    resetCreateForm()
    setShowCreateModal(false)
  }

  const handleCreatePermissionChange = (key, checked) => {
    setCreateForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: checked,
      },
    }))
  }

  const handleResetAll = () => {
    const keysToReset = [
      'importbiz_v2_registers',
      'importbiz_v2_purchases',
      'importbiz_v2_sales',
      'importbiz_v2_expenses',
      'importbiz_v2_payments',
      'importbiz_v2_audit_logs',
      'importbiz_v2_approvals',
      'importbiz_v2_settings',
    ]

    keysToReset.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch {
        // ignore storage errors
      }
    })

    setShowResetModal(false)
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

      <div className="admin-filter-bar">
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
        <Button variant="danger" onClick={() => setShowResetModal(true)}>Reset All Data</Button>
        <Button onClick={() => { resetCreateForm(); setShowCreateModal(true); }}>+ Create User</Button>
      </div>

      <div className="admin-content">
        <div className="admin-content-header">
          <h2 className="admin-content-title">Users</h2>
          <span className="admin-content-subtitle">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <Table columns={columns} data={filtered} emptyText="No users found." cardViewOnMobile />
      </div>

      {renderDetailsModal()}
      {renderPermissionsModal()}

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetCreateForm(); }} title="Create User">
        <form onSubmit={handleCreateUser}>
          <FormSection title="User Information">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Username"
              placeholder="Enter username"
              value={createForm.username}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="text"
              placeholder="Enter password"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <Select
              label="Role"
              options={roleOptions}
              value={createForm.role}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              value={createForm.status}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value }))}
            />
          </FormSection>

          <FormSection title="Permissions">
            <p className="permissions-note">All permissions are optional. Leave unchecked to deny access.</p>
            <div className="permissions-grid">
              {permissionOptions.map((perm) => (
                <label key={perm.key} className="permission-checkbox">
                  <input
                    type="checkbox"
                    checked={createForm.permissions[perm.key] || false}
                    onChange={(e) => handleCreatePermissionChange(perm.key, e.target.checked)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </FormSection>

          <div className="modal-form-actions">
            <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showResetModal} onClose={() => setShowResetModal(false)} title="Reset All Data">
        <div className="reset-warning">
          <p className="reset-warning-text">
            <strong>Warning:</strong> This action will permanently reset all application data to zero.
          </p>
          <ul className="reset-warning-list">
            <li>All registers will be deleted</li>
            <li>All purchases, sales, expenses, and payments will be deleted</li>
            <li>All audit logs will be deleted</li>
            <li>All settings will be reset to default</li>
          </ul>
          <p className="reset-warning-exception">
            <strong>Note:</strong> User credentials will <em>not</em> be affected.
          </p>
          <p className="reset-warning-confirm">
            Are you sure you want to continue?
          </p>
        </div>
        <div className="modal-form-actions">
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleResetAll}>Yes, Reset Everything</Button>
        </div>
      </Modal>
    </div>
  )
}
