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
    'Content-Type': 'application/json'
  }
});

api.defaults.headers.common['Accept'] = 'application/json; charset=utf-8';
api.defaults.headers.common['Accept-Charset'] = 'utf-8';

api.defaults.transformResponse = [...axios.defaults.transformResponse, data => {
  // Asegurarse de que las cadenas se decodifiquen correctamente
  if (typeof data === 'string') {
    return JSON.parse(data);
  }
  return data;
}];

// Interceptor para manejar caracteres especiales en las respuestas
api.interceptors.response.use(response => {
  // Validar URLs de imágenes en las respuestas
  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map(item => ({
      ...item,
      imagen: validateImageUrl(item.imagen)
    }));
  } else if (response.data && response.data.imagen) {
    response.data.imagen = validateImageUrl(response.data.imagen);
  }

  if (typeof response.data === 'object') {
    Object.keys(response.data).forEach(key => {
      if (typeof response.data[key] === 'string') {
        response.data[key] = decodeURIComponent(escape(response.data[key]));
      }
    });
  }
  return response;
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
