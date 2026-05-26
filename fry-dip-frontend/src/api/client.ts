import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (token && config.headers) {
    config.headers['X-CSRFToken'] = token;
  }
  return config;
});

export default api;