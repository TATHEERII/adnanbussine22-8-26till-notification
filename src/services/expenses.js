import { api } from './api.js'

export async function getExpenses(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.register_id) params.set('register_id', filters.register_id)
  const qs = params.toString()
  return api.get(`/api/expenses${qs ? `?${qs}` : ''}`)
}

export async function getExpense(id) {
  return api.get(`/api/expenses/${id}`)
}

export async function createExpense(data) {
  return api.post('/api/expenses', data)
}

export async function updateExpense(id, data) {
  return api.put(`/api/expenses/${id}`, data)
}
