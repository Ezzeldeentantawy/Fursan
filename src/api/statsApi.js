import api from './axios.js';

export const statsApi = {
  getStats: () => api.get('/api/v1/stats').then(res => res.data.data),
  getSiteStats: () => api.get('/api/v1/site-stats').then(res => res.data.data),
};