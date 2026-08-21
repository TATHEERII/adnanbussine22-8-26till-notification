import { api, setToken } from './api.js'

export async function login(username, password) {
  const data = await api.post('/api/auth/login', { username, password })
  setToken(data.token)
  return data.user
}

export async function logout() {
  try {
    await api.post('/api/auth/logout')
  } finally {
    setToken(null)
  }
}

export async function getCurrentUser() {
  return api.get('/api/auth/me')
}

export function isAuthenticated() {
  return !!sessionStorage.getItem('importbiz_token')
}
