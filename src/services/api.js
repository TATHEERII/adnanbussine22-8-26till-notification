const API_URL = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return sessionStorage.getItem('importbiz_token')
}

function setToken(token) {
  if (token) {
    sessionStorage.setItem('importbiz_token', token)
  } else {
    sessionStorage.removeItem('importbiz_token')
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    setToken(null)
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (path, data) => request(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export { getToken, setToken }
