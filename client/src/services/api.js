import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Before every request, attach the logged-in user's token (if there is one)
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // If the saved data is broken, just send the request without a token
  }
  return config;
});

export default api;