import request from './index'

export function addFavorite(id) {
  return request.post(`/favorites/${id}`).then(res => res.data)
}

export function removeFavorite(id) {
  return request.delete(`/favorites/${id}`).then(res => res.data)
}

export function checkFavorite(id) {
  return request.get(`/favorites/check/${id}`).then(res => res.data)
}

export function getFavorites(params) {
  return request.get('/favorites', { params }).then(res => res.data)
}
