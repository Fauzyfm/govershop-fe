import axios from 'axios';

// Server-side (SSR/RSC): Direct to Backend
// Client-side (Browser): Proxy via Next.js (/api/v1)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const baseURL = typeof window === 'undefined'
  ? `${API_URL}/api/v1` 
  : '/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Token is now sent automatically via HTTP-only cookie
// No need to add Authorization header manually
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Enhanced logging
    if (error.response) {
       console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.status, error.response.data);
    } else if (error.request) {
       console.error(`[API No Response] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    } else {
       console.error('[API Setup Error]', error.message);
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
