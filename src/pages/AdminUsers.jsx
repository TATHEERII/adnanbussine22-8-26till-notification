import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

export default function AdminUsers() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Admin / Users</h1>
        <p className="page-subtitle">Manage users and monitor system activity.</p>
      </div>
      <Card title="Users" subtitle="System users" actions={<Button>+ Add User</Button>}>
        <div className="empty-state">No users found. Users will appear here after setup.</div>
      </Card>
    </div>
  )
}
