// Field mapping between the Cloudflare D1 backend (snake_case columns)
// and the React frontend (camelCase objects). Keeping these in one place
// guarantees every page reads/writes the same shape.

const resolveName = (id, userMap) => {
  if (!id) return ''
  return (userMap && userMap[id]) || id
}

const resolveRegisterName = (registerId, registerMap) => {
  if (!registerId) return ''
  return (registerMap && registerMap[registerId]) || registerId
}

// ---- Registers -----------------------------------------------------------
export function dbToRegister(row, userMap = {}) {
  if (!row) return null
  const ownerId = row.owner_id || null
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    openingBalance: row.opening_balance,
    description: row.description,
    status: row.status,
    ownerId: ownerId,
    owner: resolveName(ownerId, userMap),
    createdBy: resolveName(ownerId, userMap),
    createdById: ownerId,
    rejectionReason: row.rejection_reason || '',
    createdAt: row.created_at,
    createdDate: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function registerToDb(obj) {
  return {
    name: obj.name,
    type: obj.type,
    opening_balance: obj.openingBalance,
    description: obj.description || null,
    status: obj.status,
  }
}

// ---- Purchases -----------------------------------------------------------
export function dbToPurchase(row, registerMap = {}, userMap = {}) {
  if (!row) return null
  const createdBy = row.created_by || null
  return {
    id: row.id,
    purchaseNumber: row.purchase_number,
    date: row.date,
    registerId: row.register_id,
    register: resolveRegisterName(row.register_id, registerMap),
    supplierName: row.supplier_name,
    description: row.description,
    amount: row.amount,
    status: row.status,
    createdBy: resolveName(createdBy, userMap),
    createdById: createdBy,
    notes: row.notes || '',
    rejectionReason: row.rejection_reason || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function purchaseToDb(obj) {
  return {
    purchase_number: obj.purchaseNumber,
    date: obj.date,
    register_id: obj.registerId,
    supplier_name: obj.supplierName || null,
    description: obj.description || null,
    amount: obj.amount,
    status: obj.status,
    notes: obj.notes || null,
  }
}

// ---- Sales --------------------------------------------------------------
export function dbToSale(row, registerMap = {}, userMap = {}) {
  if (!row) return null
  const createdBy = row.created_by || null
  return {
    id: row.id,
    saleNumber: row.sale_number,
    date: row.date,
    registerId: row.register_id,
    register: resolveRegisterName(row.register_id, registerMap),
    customerName: row.customer_name,
    description: row.description,
    amount: row.amount,
    paymentStatus: row.payment_status || 'Unpaid',
    status: row.status,
    createdBy: resolveName(createdBy, userMap),
    createdById: createdBy,
    notes: row.notes || '',
    rejectionReason: row.rejection_reason || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function saleToDb(obj) {
  return {
    sale_number: obj.saleNumber,
    date: obj.date,
    register_id: obj.registerId,
    customer_name: obj.customerName || null,
    description: obj.description || null,
    amount: obj.amount,
    payment_status: obj.paymentStatus || 'Unpaid',
    status: obj.status,
    notes: obj.notes || null,
  }
}

// ---- Expenses -----------------------------------------------------------
export function dbToExpense(row, registerMap = {}, userMap = {}) {
  if (!row) return null
  const createdBy = row.created_by || null
  return {
    id: row.id,
    expenseNumber: row.expense_number,
    date: row.date,
    registerId: row.register_id,
    register: resolveRegisterName(row.register_id, registerMap),
    category: row.category,
    description: row.description,
    amount: row.amount,
    paidThrough: row.paid_through || 'Cash',
    status: row.status,
    createdBy: resolveName(createdBy, userMap),
    createdById: createdBy,
    notes: row.notes || '',
    rejectionReason: row.rejection_reason || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function expenseToDb(obj) {
  return {
    expense_number: obj.expenseNumber,
    date: obj.date,
    register_id: obj.registerId,
    category: obj.category || null,
    description: obj.description || null,
    amount: obj.amount,
    status: obj.status,
    notes: obj.notes || null,
    paid_through: obj.paidThrough || null,
  }
}

// ---- Payments -----------------------------------------------------------
export function dbToPayment(row, registerMap = {}, userMap = {}) {
  if (!row) return null
  const createdBy = row.created_by || null
  return {
    id: row.id,
    paymentNumber: row.payment_number,
    date: row.date,
    registerId: row.register_id,
    register: resolveRegisterName(row.register_id, registerMap),
    type: row.type,
    partyName: row.party_name,
    reference: row.reference,
    amount: row.amount,
    paymentMethod: row.payment_method,
    description: row.description,
    status: row.status,
    createdBy: resolveName(createdBy, userMap),
    createdById: createdBy,
    notes: row.notes || '',
    rejectionReason: row.rejection_reason || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function paymentToDb(obj) {
  return {
    payment_number: obj.paymentNumber,
    date: obj.date,
    register_id: obj.registerId,
    type: obj.type,
    party_name: obj.partyName || null,
    reference: obj.reference || null,
    amount: obj.amount,
    payment_method: obj.paymentMethod,
    description: obj.description || null,
    status: obj.status,
    notes: obj.notes || null,
  }
}

// ---- Settings -----------------------------------------------------------
export function dbToSettings(row) {
  if (!row) return null
  return {
    businessName: row.business_name || 'Import Business',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    currency: row.currency || 'PKR',
    registerPrefix: row.register_prefix || 'REG-',
    purchasePrefix: row.purchase_prefix || 'PUR-',
    salesPrefix: row.sales_prefix || 'SAL-',
    expensePrefix: row.expense_prefix || 'EXP-',
    paymentPrefix: row.payment_prefix || 'PAY-',
    registerApproval: row.register_approval || 'Authorized User',
    purchaseApproval: row.purchase_approval || 'Authorized User',
    salesApproval: row.sales_approval || 'Authorized User',
    expenseApproval: row.expense_approval || 'Authorized User',
    paymentApproval: row.payment_approval || 'Authorized User',
  }
}

export function settingsToDb(obj) {
  return {
    business_name: obj.businessName,
    phone: obj.phone,
    email: obj.email,
    address: obj.address,
    currency: obj.currency,
    register_prefix: obj.registerPrefix,
    purchase_prefix: obj.purchasePrefix,
    sales_prefix: obj.salesPrefix,
    expense_prefix: obj.expensePrefix,
    payment_prefix: obj.paymentPrefix,
    register_approval: obj.registerApproval,
    purchase_approval: obj.purchaseApproval,
    sales_approval: obj.salesApproval,
    expense_approval: obj.expenseApproval,
    payment_approval: obj.paymentApproval,
  }
}

// ---- Audit logs ---------------------------------------------------------
// Normalise the server-side actions ('create'/'update'/'approve'/'reject',
// 'login'/'logout') to the display labels the AuditLog page filters on.
const actionLabel = {
  create: 'Created',
  update: 'Updated',
  submit: 'Submitted',
  approve: 'Approved',
  reject: 'Rejected',
  login: 'Login',
  logout: 'Logout',
}

export function dbToAuditLog(row) {
  if (!row) return null
  const action = row.action || ''
  return {
    id: row.id,
    user: row.user || '-',
    action: actionLabel[action] || action,
    module: row.module || '-',
    reference: row.reference || '-',
    register: row.register || '-',
    date: row.date || '-',
    time: row.time || '-',
    description: row.description || '-',
    oldStatus: row.old_status || '-',
    newStatus: row.new_status || '-',
  }
}

// ---- Patch (partial update) helpers ----------------------------------
// Used for in-place status changes (e.g. submit -> 'pending') and edits
// where only some fields are sent. Only keys present on the patch object
// are forwarded to the backend, so untouched columns (incl. rejection_reason
// and notes) are preserved server-side via the handler's defaults.
export function toDbPatch(obj, map) {
  const out = {}
  for (const [fk, dk] of Object.entries(map)) {
    if (fk in obj) out[dk] = obj[fk]
  }
  return out
}

export const REGISTER_DB_MAP = {
  name: 'name',
  type: 'type',
  openingBalance: 'opening_balance',
  description: 'description',
  status: 'status',
}

export const PURCHASE_DB_MAP = {
  purchaseNumber: 'purchase_number',
  date: 'date',
  registerId: 'register_id',
  supplierName: 'supplier_name',
  description: 'description',
  amount: 'amount',
  status: 'status',
  notes: 'notes',
}

export const SALE_DB_MAP = {
  saleNumber: 'sale_number',
  date: 'date',
  registerId: 'register_id',
  customerName: 'customer_name',
  description: 'description',
  amount: 'amount',
  paymentStatus: 'payment_status',
  status: 'status',
  notes: 'notes',
  rejectionReason: 'rejection_reason',
}

export const EXPENSE_DB_MAP = {
  expenseNumber: 'expense_number',
  date: 'date',
  registerId: 'register_id',
  category: 'category',
  description: 'description',
  amount: 'amount',
  paidThrough: 'paid_through',
  status: 'status',
  notes: 'notes',
  rejectionReason: 'rejection_reason',
}

export const PAYMENT_DB_MAP = {
  paymentNumber: 'payment_number',
  date: 'date',
  registerId: 'register_id',
  type: 'type',
  partyName: 'party_name',
  reference: 'reference',
  amount: 'amount',
  paymentMethod: 'payment_method',
  description: 'description',
  status: 'status',
  notes: 'notes',
}

// ---- Approvals (pending items, used for the Dashboard badge count) ---
export function dbToApproval(row) {
  if (!row) return null
  const number = row.purchase_number || row.sale_number || row.expense_number || row.payment_number || row.id
  return {
    id: row.id,
    type: row.entity_type || row.type || '',
    status: row.status,
    ownerName: row.owner_name,
    number,
  }
}
