import request from './index'

export function login(data) {
  return request.post('/auth/login', data).then(res => res.data)
}

export function register(data) {
  return request.post('/auth/register', data).then(res => res.data)
}

export function getProfile() {
  return request.get('/auth/profile').then(res => res.data)
}

export function updateProfile(data) {
  return request.put('/auth/profile', data).then(res => res.data)
}

export function getUserStats() {
  return request.get('/auth/stats').then(res => res.data)
}

export function changePassword(data) {
  return request.put('/auth/password', data).then(res => res.data)
}