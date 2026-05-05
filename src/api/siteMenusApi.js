import api from './axios.js';

const siteMenusApi = {
  getMenus: (siteId) => api.get(`/api/v1/sites/${siteId}/menus`).then(res => res.data.data),
  updateMenus: (siteId, menusData) => api.put(`/api/v1/sites/${siteId}/menus`, menusData).then(res => res.data.data),
};

export default siteMenusApi;
