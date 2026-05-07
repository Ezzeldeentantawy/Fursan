import api from './axios.js';

export const templatesApi = {
  /** Get all templates for the current site (admin) */
  getAll: (params = {}) => api.get('/api/v1/templates', { params }),

  /** Get all templates for a specific site (used by TemplatePicker) */
  getBySite: (siteId, params = {}) => api.get(`/api/v1/templates-by-site/${siteId}`, { params }),

  /** Get a single template */
  getOne: (id) => api.get(`/api/v1/templates/${id}`),

  /** Create a new template */
  create: (data) => api.post('/api/v1/templates', data),

  /** Update template metadata */
  update: (id, data) => api.put(`/api/v1/templates/${id}`, data),

  /** Update only the content (tree) of a template — used when saving from builder */
  updateContent: (id, content) => api.put(`/api/v1/templates/${id}/content`, { content }),

  /** Delete a template */
  delete: (id) => api.delete(`/api/v1/templates/${id}`),

  /** Get global elements (header + footer) for a site */
  getGlobals: (siteId) => api.get('/api/v1/global-elements', { params: { site_id: siteId } }),
};

export default templatesApi;
