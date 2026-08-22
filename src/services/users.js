import { api } from './api.js'

export async function getUsers() {
  return api.get('/api/users')
}

export async function getUserLookup() {
  return api.get('/api/users/lookup')
}

export async function createUser(data) {
  return api.post('/api/users', data)
}

export async function updateUser(id, data) {
  return api.put(`/api/users/${id}`, data)
}

export async function deleteUser(id) {
  return api.delete(`/api/users/${id}`)
}
