import axios from 'axios';

// Crear una instancia de axios con la URL base
const instance = axios.create({
  baseURL: 'https://favoritosmarket-api.onrender.com',
  timeout: 15000, // Aumentar el tiempo de espera a 15 segundos
});

// Log para depuración
console.log('API URL configurada en axiosConfig:', instance.defaults.baseURL);

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

export default instance;
