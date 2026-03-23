import axios from 'axios';

const api = axios.create({
  baseURL:"https://balaji-backend-7dos.onrender.com",
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;