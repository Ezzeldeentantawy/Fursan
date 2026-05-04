import api from './axios.js';

export const sitesApi = {
  list: (params = {}) => api.get('/api/v1/sites', { params }),
  get: (id) => api.get(`/api/v1/sites/${id}`),
  create: (data) => api.post('/api/v1/sites', data),
  update: (id, data) => api.put(`/api/v1/sites/${id}`, data),
  delete: (id) => api.delete(`/api/v1/sites/${id}`),
  toggleDefault: (id) => api.patch(`/api/v1/sites/${id}/toggle-default`),
  getDefault: () => api.get('/api/v1/sites/default'),
};
