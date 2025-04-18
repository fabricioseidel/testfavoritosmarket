import apiClient from './apiClient'; // Corregir importación

// Funciones para interactuar con la API

// Autenticación
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials); // Quitar /api
export const registerUser = (userData) => apiClient.post('/auth/register', userData); // Quitar /api

// Posts
export const getPosts = () => apiClient.get('/posts'); // Quitar /api
export const getPostById = (id) => apiClient.get(`/posts/${id}`); // Quitar /api
export const createPost = (postData) => apiClient.post('/posts/create-post', postData); // Ajustar ruta y quitar /api
export const updatePost = (id, postData) => apiClient.put(`/posts/${id}`, postData); // Quitar /api
export const deletePost = (id) => apiClient.delete(`/posts/${id}`); // Quitar /api
export const searchPosts = (query) => apiClient.get(`/posts/search?q=${encodeURIComponent(query)}`); // Añadir función de búsqueda
export const claimPost = (postId) => apiClient.put(`/posts/claim/${postId}`); // Añadir función para reclamar

// Perfil
export const getProfile = () => apiClient.get('/profile'); // Quitar /api
export const updateProfile = (profileData) => apiClient.put('/profile', profileData); // Quitar /api (y asegurar que la ruta backend sea /profile, no /profile/update)

// Categorías
export const getCategories = () => apiClient.get('/categories'); // Quitar /api

// Favoritos
export const getFavorites = () => apiClient.get('/favorites'); // Quitar /api
export const toggleFavorite = (publicacion_id) => apiClient.post('/favorites', { publicacion_id }); // Quitar /api
export const checkFavorite = (id) => apiClient.get(`/favorites/check/${id}`); // Quitar /api

// Subida de archivos (usa apiClient pero mantiene Content-Type específico)
export const uploadImage = (formData) => {
  return apiClient.post('/upload/image', formData, { // Ajustar ruta y quitar /api
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadRegistrationImage = (formData) => {
  return apiClient.post('/upload/registration-image', formData, { // Quitar /api
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Función para probar la conexión al backend (usando la baseURL directamente)
export const testApiConnection = async () => {
  try {
    // No usar apiClient aquí para probar la raíz
    const response = await fetch(apiClient.defaults.baseURL.replace('/api', '/')); // Llama a la raíz del backend
    const data = await response.json();
    console.log('Conexión API exitosa:', data);
    return data;
  } catch (error) {
    console.error('Error al conectar con la API:', error);
    throw error; // Relanzar error
  }
};
