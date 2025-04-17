import axios from 'axios';

// Crear instancia de axios con la URL base correcta
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Interceptor para incluir el token en las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log para depuración
    console.error('Error de API:', error.response || error.message);
    
    // Si el error es 401 (no autorizado), limpia el almacenamiento local
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Opcionalmente, redirigir a la página de inicio de sesión
    }
    
    return Promise.reject(error);
  }
);

export default instance;
