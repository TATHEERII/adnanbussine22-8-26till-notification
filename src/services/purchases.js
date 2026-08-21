import { api } from './api.js'

export async function getPurchases(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.register_id) params.set('register_id', filters.register_id)
  const qs = params.toString()
  return api.get(`/api/purchases${qs ? `?${qs}` : ''}`)
}

export async function getPurchase(id) {
  return api.get(`/api/purchases/${id}`)
}

export async function createPurchase(data) {
  return api.post('/api/purchases', data)
}

export async function updatePurchase(id, data) {
  return api.put(`/api/purchases/${id}`, data)
}
