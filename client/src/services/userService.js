import http from './http'

export const userApi = {
  getUsers: (params) =>
    http
      .get('/users', { params })
      .then((res) => res.data),

  createUser: (payload) =>
    http
      .post('/users', payload)
      .then((res) => res.data),

  resetUserPassword: (id) =>
    http
      .patch(`/users/${id}/reset-password`)
      .then((res) => res.data),
}
