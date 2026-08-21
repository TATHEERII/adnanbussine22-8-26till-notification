// One-time migration: add the `notes` column (and `paid_through` for expenses)
// to the transaction tables on an ALREADY-DEPLOYED Cloudflare D1 database.
//
// The worker is backwards/forwards-compatible with this migration thanks to
// the `setOptionalColumns` best-effort helper in lib.js: writes never break
// even if these columns are absent. Run this once to actually persist the
// extra fields. Re-running is safe (SQLite reports "duplicate column name",
// which you can ignore, or remove the statements already applied).
//
// Run with:  npm run db:migrate:notes
// Then:      npx wrangler d1 execute importbiz-db --file=migrate_add_notes.sql

const fs = require('fs');
const path = require('path');

const statements = [
  'ALTER TABLE purchases ADD COLUMN notes TEXT;',
  'ALTER TABLE sales ADD COLUMN notes TEXT;',
  'ALTER TABLE expenses ADD COLUMN notes TEXT;',
  'ALTER TABLE expenses ADD COLUMN paid_through TEXT;',
  'ALTER TABLE payments ADD COLUMN notes TEXT;',
];

const outDir = path.join(process.cwd());
fs.writeFileSync(path.join(outDir, 'migrate_add_notes.sql'), statements.join('\n') + '\n');
console.log('Wrote migrate_add_notes.sql:\n' + statements.join('\n'));
