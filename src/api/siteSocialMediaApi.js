import api from './axios.js';

const siteSocialMediaApi = {
  getSocialMedia: (siteId) => api.get(`/api/v1/sites/${siteId}/social-media`).then(res => res.data.data),
  updateSocialMedia: (siteId, socialData) => api.put(`/api/v1/sites/${siteId}/social-media`, socialData).then(res => res.data.data),
};

export default siteSocialMediaApi;
