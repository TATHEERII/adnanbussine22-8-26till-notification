import { api } from './api.js'

export async function getRegisters(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.owner_id) params.set('owner_id', filters.owner_id)
  const qs = params.toString()
  return api.get(`/api/registers${qs ? `?${qs}` : ''}`)
}

export async function getRegister(id) {
  return api.get(`/api/registers/${id}`)
}

export async function createRegister(data) {
  return api.post('/api/registers', data)
}

export async function updateRegister(id, data) {
  return api.put(`/api/registers/${id}`, data)
}
