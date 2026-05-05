import api from './axios.js';

export const sitesApi = {
  list: (params = {}) => api.get('/api/v1/sites', { params }),
  get: (id, params = {}) => api.get(`/api/v1/sites/${id}`, { params }),
  create: (data) => api.post('/api/v1/sites', data),
  update: (id, data) => api.put(`/api/v1/sites/${id}`, data),
  /**
   * Update site with favicon support
   * @param {number} id - Site ID
   * @param {Object} data - Site data including optional favicon_media_id
   * @param {Object} params - Optional query params (e.g., include)
   */
  updateWithFavicon: (id, data, params = {}) => api.put(`/api/v1/sites/${id}`, data, { params }),
  delete: (id) => api.delete(`/api/v1/sites/${id}`),
  toggleDefault: (id) => api.patch(`/api/v1/sites/${id}/toggle-default`),
  getDefault: () => api.get('/api/v1/sites/default', { params: { include: 'favicon' } }),
  checkDomain: (domain) => api.get(`/api/v1/sites/check-domain/${domain}`),
};
