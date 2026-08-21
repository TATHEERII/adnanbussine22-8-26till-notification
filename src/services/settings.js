import { api } from './api.js'

export async function getSettings() {
  return api.get('/api/settings')
}

export async function updateSettings(data) {
  return api.put('/api/settings', data)
}
