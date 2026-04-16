import http from './http'

export const contactApi = {
  sendMessage: (payload) =>
    http
      .post('/contact', payload)
      .then((res) => res.data),
}
