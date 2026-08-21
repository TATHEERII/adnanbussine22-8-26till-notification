-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  permissions JSON DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Registers table
CREATE TABLE IF NOT EXISTS registers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'General',
  opening_balance REAL DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'draft',
  owner_id TEXT NOT NULL,
  rejection_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  purchase_number TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  register_id TEXT NOT NULL,
  supplier_name TEXT,
  description TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by TEXT NOT NULL,
  rejection_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (register_id) REFERENCES registers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  sale_number TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  register_id TEXT NOT NULL,
  customer_name TEXT,
  description TEXT,
  amount REAL NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  status TEXT DEFAULT 'draft',
  created_by TEXT NOT NULL,
  rejection_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (register_id) REFERENCES registers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expense_number TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  register_id TEXT NOT NULL,
  category TEXT,
  description TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by TEXT NOT NULL,
  rejection_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (register_id) REFERENCES registers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  payment_number TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  register_id TEXT NOT NULL,
  type TEXT DEFAULT 'received',
  party_name TEXT,
  reference TEXT,
  amount REAL NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_by TEXT NOT NULL,
  rejection_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (register_id) REFERENCES registers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  reference TEXT,
  register TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT,
  old_status TEXT,
  new_status TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  business_name TEXT DEFAULT 'Import Business',
  phone TEXT,
  email TEXT,
  address TEXT,
  currency TEXT DEFAULT 'PKR',
  register_prefix TEXT DEFAULT 'REG-',
  purchase_prefix TEXT DEFAULT 'PUR-',
  sales_prefix TEXT DEFAULT 'SAL-',
  expense_prefix TEXT DEFAULT 'EXP-',
  payment_prefix TEXT DEFAULT 'PAY-',
  register_approval TEXT DEFAULT 'Authorized User',
  purchase_approval TEXT DEFAULT 'Authorized User',
  sales_approval TEXT DEFAULT 'Authorized User',
  expense_approval TEXT DEFAULT 'Authorized User',
  payment_approval TEXT DEFAULT 'Authorized User',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  reference TEXT,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sync queue table (for offline sync)
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity TEXT NOT NULL,
  record_id TEXT,
  payload JSON NOT NULL,
  timestamp TEXT NOT NULL,
  retries INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sync conflicts table
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  record_id TEXT NOT NULL,
  local_data JSON NOT NULL,
  server_data JSON NOT NULL,
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registers_status ON registers(status);
CREATE INDEX IF NOT EXISTS idx_registers_owner ON registers(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_register ON purchases(register_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_register ON sales(register_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_register ON expenses(register_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_register ON payments(register_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_timestamp ON sync_queue(timestamp);
