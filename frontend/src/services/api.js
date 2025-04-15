import axios from 'axios';

const DEFAULT_IMAGE = '/default-image.jpg';

const validateImageUrl = (url) => {
  if (!url) return DEFAULT_IMAGE;
  try {
    new URL(url);
    return url;
  } catch {
    return url.startsWith('/') ? url : `/${url}`;
  }
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  }
});

api.defaults.headers.common['Accept-Charset'] = 'utf-8';

// Interceptor para preservar todos los campos en la respuesta
api.interceptors.response.use(response => {
  // Log para depuración
  console.log('Respuesta recibida del backend:', JSON.stringify(response.data, null, 2));
  
  // Validar URLs de imágenes en las respuestas
  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map(item => ({
      ...item,
      imagen: validateImageUrl(item.imagen),
      // Asegurar que se preserve la categoría
      categoria: item.categoria || 'Sin categoría'
    }));
  } else if (response.data && typeof response.data === 'object') {
    // Para objetos individuales
    if (response.data.imagen) {
      response.data.imagen = validateImageUrl(response.data.imagen);
    }
    // Asegurar que se preserve la categoría
    if (response.data.categoria_id && !response.data.categoria) {
      response.data.categoria = 'Sin categoría';
    }
  }

  // Decodificar caracteres especiales en strings
  if (typeof response.data === 'object') {
    Object.keys(response.data).forEach(key => {
      if (typeof response.data[key] === 'string') {
        response.data[key] = decodeURIComponent(escape(response.data[key]));
      }
    });
  }
  
  return response;
}, error => {
  // Manejar errores
  console.error('Error en la respuesta:', error);
  return Promise.reject(error);
});

// Interceptor para incluir el token en las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
