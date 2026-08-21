import { api } from './api.js'

export async function getReport(type, filters = {}) {
  const params = new URLSearchParams()
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.register_id) params.set('register_id', filters.register_id)
  const qs = params.toString()
  return api.get(`/api/reports/${type}${qs ? `?${qs}` : ''}`)
}
