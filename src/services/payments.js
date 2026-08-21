import { api } from './api.js'

export async function getPayments(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.register_id) params.set('register_id', filters.register_id)
  if (filters.type) params.set('type', filters.type)
  const qs = params.toString()
  return api.get(`/api/payments${qs ? `?${qs}` : ''}`)
}

export async function getPayment(id) {
  return api.get(`/api/payments/${id}`)
}

export async function createPayment(data) {
  return api.post('/api/payments', data)
}

export async function updatePayment(id, data) {
  return api.put(`/api/payments/${id}`, data)
}
