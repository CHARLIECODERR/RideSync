import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_DB === 'true';

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

export const isLocalMode = () => USE_LOCAL;

