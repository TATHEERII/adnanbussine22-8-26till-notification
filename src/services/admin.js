import { api } from './api.js'

export async function resetAllData() {
  return api.delete('/api/admin/reset')
}
