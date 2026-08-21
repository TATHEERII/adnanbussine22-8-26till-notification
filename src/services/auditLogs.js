import { api } from './api.js'

export async function getAuditLogs(filters = {}) {
  const params = new URLSearchParams()
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.module) params.set('module', filters.module)
  if (filters.action) params.set('action', filters.action)
  const qs = params.toString()
  return api.get(`/api/audit-logs${qs ? `?${qs}` : ''}`)
}
