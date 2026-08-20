export const mockUsers = [
  { id: 'u1', name: 'Admin User', username: 'admin', email: 'admin@importbiz.com', role: 'admin', status: 'active', createdAt: '2026-01-01', lastActivity: '2026-08-20', registerCount: 0, permissions: { canCreateRegister: true, canCreatePurchase: true, canCreateSale: true, canCreateExpense: true, canCreatePayment: true, canApprove: false, canViewReports: true, canViewAuditLog: true } },
  { id: 'u2', name: 'Ali Khan', username: 'ali', email: 'ali@importbiz.com', role: 'user', status: 'active', createdAt: '2026-02-15', lastActivity: '2026-08-19', registerCount: 0, permissions: { canCreateRegister: true, canCreatePurchase: true, canCreateSale: true, canCreateExpense: true, canCreatePayment: true, canApprove: true, canViewReports: true, canViewAuditLog: true } },
  { id: 'u3', name: 'Ahmed Raza', username: 'ahmed', email: 'ahmed@importbiz.com', role: 'user', status: 'active', createdAt: '2026-03-10', lastActivity: '2026-08-18', registerCount: 0, permissions: { canCreateRegister: true, canCreatePurchase: true, canCreateSale: true, canCreateExpense: true, canCreatePayment: true, canApprove: true, canViewReports: true, canViewAuditLog: true } },
]

export const mockRegisters = []

export const mockTransactions = []

export const mockApprovals = []

export const mockAuditLogs = []

export const mockPurchases = []

export const mockSales = []

export const mockExpenses = []

export const mockPayments = []

export const currentUser = { id: 'u2', name: 'Ali Khan', username: 'ali', email: 'ali@importbiz.com', role: 'user' }
