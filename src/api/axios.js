import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,  // ✅ IMPORTANT: Allow cookies for Sanctum
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Function to read cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

// ✅ Request interceptor to add CSRF token and auth token
api.interceptors.request.use(
  (config) => {
    // Read XSRF-TOKEN from cookie and set as header
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
    
    // Add auth token if available (for Bearer token auth)
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.response) {
      console.error('[API] Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('[API] Request error (no response):', error.request);
    } else {
      console.error('[API] Error:', error.message);
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized, clearing auth tokens');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
    
    return Promise.reject(error);
  }
);

export default api;
