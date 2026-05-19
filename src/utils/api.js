import axios from 'axios';
import { deleteCookie, getCookie } from './cookie';

// Using the provided ASP.NET Core dev port
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://risen-org-back.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = getCookie('risen_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie('risen_token');

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
