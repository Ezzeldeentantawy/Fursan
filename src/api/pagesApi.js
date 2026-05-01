import api from './axios.js';
const BASE = '/api/v1/pages';
const BASE_PUBLIC = '/api/v1/';

/**
 * API Response Handling Pattern:
 *
 * Laravel JsonResource wraps responses in { data: {...} }
 * Axios also wraps the HTTP response in { data: {...} }
 *
 * These methods return `res.data` (the JsonResource wrapper):
 *   { data: <actualData>, ... }
 *
 * Components must unwrap with:
 *   const res = await pagesApi.getBySlug(slug);
 *   const pageData = res.data.data || res.data;
 */

export const pagesApi = {
  /** GET /api/v1/pages */
  getAll: (lang = 'en') => api.get(BASE, { params: { lang } }),

  /** GET /api/v1/pages/:id
   * Pass lang so Laravel returns the correct language version
   */
  getOne: (id, lang = 'en') => api.get(`${BASE}/${id}`, { params: { lang } }),

  /** POST /api/v1/pages */
  create: (data) => api.post(BASE, data),

  /** PUT /api/v1/pages/:id
   * Pass lang so Laravel knows which columns (content vs content_ar) to update
   */
  update: (id, data, lang = 'en') => api.put(`${BASE}/${id}`, data, { params: { lang } }),

  /** POST /api/v1/pages/:id/translate-ar
   * Duplicates the English page content as a new Arabic translation
   */
  translateToArabic: (id) => api.post(`${BASE}/${id}/translate-ar`),

  /** GET /api/v1/render/:slug
   * This is for the PageRenderer / DynamicPage frontend
   */
  getBySlug: (slug, lang = 'en') => api.get(`${BASE_PUBLIC}render/${slug}`, { params: { lang } }),

  setHomepage: (id) => api.patch(`${BASE}/${id}/set-home`),

  /** DELETE /api/v1/pages/:id */
  destroy: (id) => api.delete(`${BASE}/${id}`),
};

export default pagesApi;
