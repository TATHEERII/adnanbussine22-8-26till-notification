import { api } from './api.js'

export async function getSales(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.register_id) params.set('register_id', filters.register_id)
  const qs = params.toString()
  return api.get(`/api/sales${qs ? `?${qs}` : ''}`)
}

export async function getSale(id) {
  return api.get(`/api/sales/${id}`)
}

export async function createSale(data) {
  return api.post('/api/sales', data)
}

export async function updateSale(id, data) {
  return api.put(`/api/sales/${id}`, data)
}
