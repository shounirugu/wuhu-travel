import request from './index'

export function aiChat(message, history = []) {
  return request.post('/ai/chat', { message, history })
}

export function aiPlan(params) {
  return request.post('/ai/plan', params)
}

export function getAiHistory() {
  return request.get('/ai/history').then(res => res.data)
}

export function getAiHistoryBySession(sessionId) {
  return request.get('/ai/history', { params: { session_id: sessionId } }).then(res => res.data)
}

export function saveAiHistory(data) {
  return request.post('/ai/history', data).then(res => res.data)
}
