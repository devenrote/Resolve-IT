import http from './http'

export const authApi = {
  register: (payload) => http.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => http.post('/auth/login', payload).then((res) => res.data),
  me: () => http.get('/auth/me').then((res) => res.data),
  updateProfile: (payload) => http.put('/auth/profile', payload).then((res) => res.data),
}
