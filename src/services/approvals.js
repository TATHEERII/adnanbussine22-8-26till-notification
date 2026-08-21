import { api } from './api.js'

export async function getApprovals() {
  return api.get('/api/approvals')
}

export async function approve(entity, id) {
  return api.post(`/api/approvals/${entity}/${id}/approve`)
}

export async function reject(entity, id, rejection_reason) {
  return api.post(`/api/approvals/${entity}/${id}/reject`, { rejection_reason })
}
