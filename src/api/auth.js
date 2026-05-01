import api from './axios.js';

// ✅ Helper function to read cookie (duplicated here for auth debugging)
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * Authentication API module
 * Handles login, register, logout, and user session checks
 */

export const authApi = {
  /**
   * Check if user is authenticated
   * @returns {Promise<Object|null>} User object if authenticated, null if not
   */
  async checkAuth() {
    try {
      const res = await api.get('/api/v1/user');
      return res.data.data || res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        return null; // Not authenticated
      }
      throw err;
    }
  },

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    try {
      console.log('[Auth] Getting CSRF cookie...');
      
      // ✅ Get CSRF cookie - this sets the XSRF-TOKEN cookie
      const csrfRes = await api.get('/sanctum/csrf-cookie');
      console.log('[Auth] CSRF cookie response status:', csrfRes.status);
      
      // ✅ Check if cookie was set
      const xsrfToken = getCookie('XSRF-TOKEN');
      console.log('[Auth] XSRF-TOKEN cookie after CSRF request:', xsrfToken ? 'Found' : 'Not found');
      
      // ✅ Small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[Auth] Attempting login...');
      
      // ✅ Now make the login request - axios interceptor will add the CSRF token
      // Note: auth routes are in web.php, not api.php
      const res = await api.post('/auth/login', { email, password });
      console.log('[Auth] Login response:', res.status);
      return res.data.data || res.data;
    } catch (err) {
      console.error('[Auth] Login error:', err.message);
      console.error('[Auth] Error response:', err.response?.data);
      console.error('[Auth] Error status:', err.response?.status);
      throw err;
    }
  },

  /**
   * Register new user (candidate)
   * @param {Object} userData - { name, email, password, passwordConfirmation }
   * @returns {Promise<Object>} Registration response
   */
  async register({ name, email, password, passwordConfirmation }) {
    try {
      console.log('[Auth] Getting CSRF cookie for registration...');
      
      // ✅ Get CSRF cookie
      await api.get('/sanctum/csrf-cookie');
      
      // ✅ Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[Auth] Attempting registration...');
      
      // ✅ Note: register endpoint is /auth/register/candidate (not just /auth/register)
      const res = await api.post('/auth/register/candidate', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      console.log('[Auth] Registration response:', res.status);
      return res.data.data || res.data;
    } catch (err) {
      console.error('[Auth] Registration error:', err.message);
      console.error('[Auth] Error response:', err.response?.data);
      throw err;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // ✅ Note: logout endpoint is in web.php under /auth/logout
      await api.post('/auth/logout');
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    }
  },

  /**
   * Subscribe to newsletter
   * @param {string} email
   * @returns {Promise<Object>} Subscription response
   */
  async subscribeNewsletter(email) {
    const res = await api.post('/api/v1/newsletter/subscribe', { email });
    return res.data.data || res.data;
  },

  /**
   * Submit contact form
   * @param {Object} contactData - { name, email, message }
   * @returns {Promise<Object>} Submission response
   */
  async submitContact({ name, email, message }) {
    const res = await api.post('/api/v1/contact', { name, email, message });
    return res.data.data || res.data;
  }
};

export default authApi;
