import axios from 'axios';

// Crear una instancia de axios con la URL base
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Interceptor para añadir token en cada solicitud
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

// Interceptor para manejar errores de autenticación
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Si recibimos un 401, podríamos redirigir al login
      console.log('Sesión expirada o token inválido');
    }
    return Promise.reject(error);
  }
);

export default instance;
