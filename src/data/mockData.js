export const mockUsers = [
  { id: 'u1', name: 'Admin User', username: 'admin', email: 'admin@importbiz.com', role: 'admin', status: 'active', createdAt: '2026-01-01', lastActivity: '2026-08-20', registerCount: 0 },
  { id: 'u2', name: 'Ali Khan', username: 'ali', email: 'ali@importbiz.com', role: 'user', status: 'active', createdAt: '2026-02-15', lastActivity: '2026-08-19', registerCount: 3 },
  { id: 'u3', name: 'Ahmed Raza', username: 'ahmed', email: 'ahmed@importbiz.com', role: 'user', status: 'active', createdAt: '2026-03-10', lastActivity: '2026-08-18', registerCount: 2 },
]

export const mockRegisters = [
  { id: 'r1', name: 'Main Import Register', owner: 'Ali Khan', ownerId: 'u2', type: 'Import', openingBalance: 50000, createdDate: '2026-02-16', status: 'active', description: 'Primary import operations register', rejectionReason: '' },
  { id: 'r2', name: 'Local Sales Register', owner: 'Ahmed Raza', ownerId: 'u3', type: 'Sales', openingBalance: 20000, createdDate: '2026-03-11', status: 'active', description: 'Local retail sales tracking', rejectionReason: '' },
  { id: 'r3', name: 'Expense Register', owner: 'Ali Khan', ownerId: 'u2', type: 'Expense', openingBalance: 0, createdDate: '2026-03-12', status: 'draft', description: 'Track business expenses', rejectionReason: '' },
  { id: 'r4', name: 'New Supplier Ledger', owner: 'Ali Khan', ownerId: 'u2', type: 'Purchase', openingBalance: 10000, createdDate: '2026-08-18', status: 'pending', description: 'New supplier account', rejectionReason: '' },
  { id: 'r5', name: 'Rejected Register', owner: 'Ahmed Raza', ownerId: 'u3', type: 'Import', openingBalance: 25000, createdDate: '2026-08-19', status: 'rejected', description: 'Rejected due to incomplete info', rejectionReason: 'Please add opening balance details and contact information.' },
]

export const mockTransactions = [
  { id: 't1', date: '2026-08-01', register: 'Main Import Register', type: 'Purchase', description: 'Container purchase', amount: 250000, status: 'approved', createdBy: 'Ali Khan' },
  { id: 't2', date: '2026-08-05', register: 'Main Import Register', type: 'Sale', description: 'Bulk sale to retailer', amount: 320000, status: 'approved', createdBy: 'Ahmed Raza' },
  { id: 't3', date: '2026-08-10', register: 'Local Sales Register', type: 'Expense', description: 'Transport cost', amount: 15000, status: 'approved', createdBy: 'Ali Khan' },
  { id: 't4', date: '2026-08-12', register: 'Main Import Register', type: 'Payment', description: 'Payment received', amount: 100000, status: 'approved', createdBy: 'Ahmed Raza' },
  { id: 't5', date: '2026-08-19', register: 'Main Import Register', type: 'Purchase', description: 'Raw material order', amount: 45000, status: 'pending', createdBy: 'Ali Khan' },
  { id: 't6', date: '2026-08-20', register: 'Local Sales Register', type: 'Expense', description: 'Office supplies', amount: 8000, status: 'approved', createdBy: 'Ali Khan' },
  { id: 't7', date: '2026-08-20', register: 'Main Import Register', type: 'Sale', description: 'Cash sale', amount: 55000, status: 'approved', createdBy: 'Ahmed Raza' },
  { id: 't8', date: '2026-08-20', register: 'Local Sales Register', type: 'Payment', description: 'Supplier payment', amount: 20000, status: 'pending', createdBy: 'Ali Khan' },
]

export const mockApprovals = [
  { id: 'a1', reference: 'REG-0001', register: 'New Register', createdBy: 'Ali Khan', date: '2026-08-18', type: 'Register', amount: '-', status: 'pending' },
  { id: 'a2', reference: 'PUR-0045', register: 'Main Import Register', createdBy: 'Ali Khan', date: '2026-08-19', type: 'Purchase', amount: 50000, status: 'pending' },
  { id: 'a3', reference: 'SAL-0032', register: 'Local Sales Register', createdBy: 'Ahmed Raza', date: '2026-08-19', type: 'Sale', amount: 75000, status: 'pending' },
]

export const mockAuditLogs = [
  { id: 'l1', user: 'Ali Khan', action: 'Register Created', module: 'Registers', reference: 'REG-0003', register: 'Expense Register', date: '2026-03-12', time: '10:30', description: 'Created new register', oldStatus: '-', newStatus: 'Draft' },
  { id: 'l2', user: 'System', action: 'Login', module: 'Auth', reference: '-', register: '-', date: '2026-08-20', time: '09:15', description: 'Admin logged in', oldStatus: '-', newStatus: '-' },
]

export const currentUser = { id: 'u2', name: 'Ali Khan', username: 'ali', email: 'ali@importbiz.com', role: 'user' }
