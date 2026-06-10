import request from './index'

export function getCategories() {
  return request.get('/categories')
}
