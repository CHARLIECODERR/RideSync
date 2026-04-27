import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ridesync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const isLocalMode = () => {
  // 1. Check explicit override in .env
  const explicitLocal = import.meta.env.VITE_USE_LOCAL_DB;
  if (explicitLocal === 'true') return true;
  if (explicitLocal === 'false') return false;

  // 2. Auto-detect based on environment
  const isLocalHost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  return isLocalHost;
};

