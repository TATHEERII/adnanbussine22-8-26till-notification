import bcrypt from 'bcryptjs';

export async function seed(env) {
  const db = env.DB;
  
  // Check if admin already exists
  const existingAdmin = await db.prepare('SELECT id FROM users WHERE username = ?').bind('admin').first();
  if (existingAdmin) {
    console.log('Admin user already exists, skipping seed.');
    return;
  }

  // Hash password for admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  // Insert admin user
  const adminId = 'user-admin-001';
  await db.prepare(`
    INSERT INTO users (id, username, password_hash, name, email, role, status, permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    adminId,
    'admin',
    passwordHash,
    'System Admin',
    'admin@importbusiness.com',
    'admin',
    'active',
    JSON.stringify({
      canCreateRegister: true,
      canCreatePurchase: true,
      canCreateSale: true,
      canCreateExpense: true,
      canCreatePayment: true,
      canApprove: true,
      canViewReports: true,
      canViewAuditLog: true,
    })
  );

  // Insert default settings
  await db.prepare(`
    INSERT INTO settings (id, business_name, phone, email, address, currency, register_prefix, purchase_prefix, sales_prefix, expense_prefix, payment_prefix)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
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
    'PAY-'
  );

  console.log('Seed data inserted successfully.');
}
