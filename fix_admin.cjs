const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
const sql = "UPDATE users SET password_hash='" + hash + "' WHERE username='admin';";
const fs = require('fs');
fs.writeFileSync('seed_admin.sql', sql);
console.log('Hash:', hash);
console.log('SQL:', sql);
