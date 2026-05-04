import api from './axios.js';

export const mediaApi = {
  /** GET /api/v1/media */
  getAll: (params = {}) => api.get('/api/v1/media', { params }),
  
  /** POST /api/v1/media */
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  /** DELETE /api/v1/media/:id */
  delete: (id) => api.delete(`/api/v1/media/${id}`),
};
