import axios from '../axiosConfig';

// Funciones para interactuar con la API

// Autenticación
export const loginUser = (credentials) => axios.post('/api/auth/login', credentials);
export const registerUser = (userData) => axios.post('/api/auth/register', userData);

// Posts
export const getPosts = () => axios.get('/api/posts');
export const getPostById = (id) => axios.get(`/api/posts/${id}`);
export const createPost = (postData) => axios.post('/api/posts', postData);
export const updatePost = (id, postData) => axios.put(`/api/posts/${id}`, postData);
export const deletePost = (id) => axios.delete(`/api/posts/${id}`);

// Perfil
export const getProfile = () => axios.get('/api/profile');
export const updateProfile = (profileData) => axios.put('/api/profile', profileData);

// Categorías
export const getCategories = () => axios.get('/api/categories');

// Favoritos
export const getFavorites = () => axios.get('/api/favorites');
export const addToFavorites = (postId) => axios.post('/api/favorites', { postId });
export const removeFromFavorites = (postId) => axios.delete(`/api/favorites/${postId}`);

// Subida de archivos
export const uploadImage = (formData) => {
  return axios.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Función para probar la conexión al backend
export const testApiConnection = async () => {
  try {
    const response = await axios.get('/');
    console.log('Conexión API exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al conectar con la API:', error);
    throw error;
  }
};
