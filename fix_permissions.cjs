const fs = require('fs');
const permissions = JSON.stringify({
  canCreateRegister: true,
  canCreatePurchase: true,
  canCreateSale: true,
  canCreateExpense: true,
  canCreatePayment: true,
  canApprove: true,
  canViewReports: true,
  canViewAuditLog: true,
});
const sql = "UPDATE users SET permissions='" + permissions + "' WHERE username='admin';";
fs.writeFileSync('fix_permissions.sql', sql);
console.log('SQL:', sql);
