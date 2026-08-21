-- Seed: insert admin user + default settings into importbiz-db
-- Run with: npx wrangler d1 execute importbiz-db --file=seed_data.sql --remote

INSERT INTO users (id, username, password_hash, name, email, role, status, permissions)
VALUES (
  'user-admin-001',
  'admin',
  '$2b$10$JeH3E9oJ4NeDryVIZxoGKeEW/2sEjdlPzsiAlXNuT9pjUIACYsKG6',
  'System Admin',
  'admin@importbusiness.com',
  'admin',
  'active',
  '{"canCreateRegister":true,"canCreatePurchase":true,"canCreateSale":true,"canCreateExpense":true,"canCreatePayment":true,"canApprove":true,"canViewReports":true,"canViewAuditLog":true}'
);

INSERT INTO settings (id, business_name, phone, email, address, currency, register_prefix, purchase_prefix, sales_prefix, expense_prefix, payment_prefix, register_approval, purchase_approval, sales_approval, expense_approval, payment_approval)
VALUES (
  1,
  'Import Business',
  '+92-300-1234567',
  'info@importbusiness.com',
  '123 Business Street, Karachi, Pakistan',
  'PKR',
  'REG-',
  'PUR-',
  'SAL-',
  'EXP-',
  'PAY-',
  'Authorized User',
  'Authorized User',
  'Authorized User',
  'Authorized User',
  'Authorized User'
);
