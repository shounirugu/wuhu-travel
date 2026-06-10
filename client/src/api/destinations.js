import request from './index'

export function getDestinations(params) {
  return request.get('/destinations', { params })
}

export function getFeaturedDestinations() {
  return request.get('/destinations/featured')
}

export function getDestinationById(id) {
  return request.get(`/destinations/${id}`)
}
