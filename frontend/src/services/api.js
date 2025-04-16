import axios from 'axios';

// En producción, las peticiones irán al mismo host/puerto
// En desarrollo, usamos el proxy configurado en package.json
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
});

// Interceptor para añadir el token en cada solicitud
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
