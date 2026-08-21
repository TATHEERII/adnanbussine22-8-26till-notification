const url = 'http://127.0.0.1:8788/api/auth/login';

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' }),
})
  .then((r) => r.text())
  .then((text) => console.log('Response:', text))
  .catch((err) => console.error('Error:', err));
