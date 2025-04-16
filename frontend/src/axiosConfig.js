import axios from 'axios';

// Crear una instancia de axios con la URL base
const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '' // En producción, apuntamos al mismo dominio
    : 'http://localhost:5000' // En desarrollo
});

// Interceptor para añadir token de autenticación a las solicitudes
instance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
