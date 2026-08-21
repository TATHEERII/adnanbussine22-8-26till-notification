const fs = require('fs');
const path = require('path');

const redirectsPath = path.join(process.cwd(), 'dist', '_redirects');
fs.writeFileSync(redirectsPath, '/favicon.ico  /vite.svg  200\n');
console.log('Created _redirects for SPA fallback');
