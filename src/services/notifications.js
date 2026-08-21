import { api } from './api.js'

export async function getNotifications(filters = {}) {
  const params = new URLSearchParams()
  if (filters.unread) params.set('unread', 'true')
  const qs = params.toString()
  return api.get(`/api/notifications${qs ? `?${qs}` : ''}`)
}

export async function markNotificationsRead(ids) {
  return api.post('/api/notifications/mark-read', { ids })
}
