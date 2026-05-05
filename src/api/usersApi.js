import api from './axios.js';

export const usersApi = {
  list: () => api.get('/api/v1/users').then(res => res.data.data),
  get: (id) => api.get(`/api/v1/users/${id}`).then(res => res.data.data),
  create: (data) => api.post('/api/v1/users', data).then(res => res.data.data),
  update: (id, data) => api.put(`/api/v1/users/${id}`, data).then(res => res.data.data),
  changePassword: (id, data) => api.put(`/api/v1/users/${id}/password`, data).then(res => res.data),
  remove: (id) => api.delete(`/api/v1/users/${id}`).then(res => res.data),
};
