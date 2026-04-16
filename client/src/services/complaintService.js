import http from './http'

export const complaintApi = {
  create: (formData) =>
    http
      .post('/complaints', formData)
      .then((res) => res.data),

  getMyComplaints: (params) =>
    http
      .get('/complaints/my', { params })
      .then((res) => res.data),

  trackMyComplaintByTicket: (ticketId) =>
    http
      .get(`/complaints/my/track/${encodeURIComponent(ticketId)}`)
      .then((res) => res.data),

  updateMyComplaint: (id, payload) =>
    http
      .put(`/complaints/my/${id}`, payload)
      .then((res) => res.data),

  cancelMyComplaint: (id) =>
    http
      .delete(`/complaints/my/${id}`)
      .then((res) => res.data),

  getAllComplaints: (params) =>
    http
      .get('/complaints', { params })
      .then((res) => res.data),

  updateStatus: (id, status) =>
    http
      .patch(`/complaints/${id}/status`, { status })
      .then((res) => res.data),

  deleteComplaint: (id) =>
    http
      .delete(`/complaints/${id}`)
      .then((res) => res.data),

  analytics: () =>
    http
      .get('/complaints/analytics/summary')
      .then((res) => res.data),
}
