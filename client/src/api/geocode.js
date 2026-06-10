import request from './index'

export function geocode(address) {
  return request.get('/geocode', { params: { address } }).then(res => res.data)
}
