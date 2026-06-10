import request from './index'

export function addReview(id, data) {
  return request.post(`/reviews/${id}`, data).then(res => res.data)
}

export function getReviews(id, params) {
  return request.get(`/reviews/${id}`, { params }).then(res => res.data)
}

export function getMyReviews(params) {
  return request.get('/reviews/mine', { params }).then(res => res.data)
}
