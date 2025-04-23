import axios from 'axios';
import { API_BASE_URL, API_ROUTES } from './apiRoutes';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
          console.log('Token añadido a la cabecera:', `Bearer ${user.token.substring(0, 10)}...`);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('user'); // Limpiar si está corrupto
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Definición de Servicios ---

// Servicio de Autenticación
export const authService = {
  register: (userData) => apiClient.post(API_ROUTES.REGISTER, userData),
  login: (credentials) => apiClient.post(API_ROUTES.LOGIN, credentials),
  logout: () => apiClient.post(API_ROUTES.LOGOUT),
  getProfile: () => apiClient.get(API_ROUTES.PROFILE),
  updateProfile: (profileData) => apiClient.put(API_ROUTES.UPDATE_PROFILE, profileData),
};

// Servicio de Publicaciones
export const postService = {
  getAllPosts: (config) => apiClient.get(API_ROUTES.GET_ALL_POSTS, config),
  getPostById: (id) => apiClient.get(API_ROUTES.GET_POST_BY_ID(id)),
  createPost: (postData) => apiClient.post(API_ROUTES.CREATE_POST, postData),
  updatePost: (id, postData) => apiClient.put(API_ROUTES.UPDATE_POST(id), postData),
  deletePost: (id) => apiClient.delete(API_ROUTES.DELETE_POST(id)),
  getUserPosts: (config) => apiClient.get(API_ROUTES.GET_USER_POSTS, config),
  searchPosts: (query, categoryId, config) => {
    const params = {};
    if (query) params.q = query;
    if (categoryId) params.categoria_id = categoryId; // Añadir categoria_id a los parámetros
    return apiClient.get(API_ROUTES.SEARCH_POSTS, { params, ...config });
  },
  claimPost: (postId) => apiClient.put(API_ROUTES.CLAIM_POST(postId)),
};

// Servicio de Categorías
export const categoryService = {
  getAllCategories: (config) => apiClient.get(API_ROUTES.GET_ALL_CATEGORIES, config),
  getCategoryById: (id) => apiClient.get(API_ROUTES.GET_CATEGORY_BY_ID(id)),
  // create, update, delete (si son necesarios y tienes permisos)
};

// Servicio de Favoritos
export const favoriteService = {
  getFavorites: () => apiClient.get(API_ROUTES.GET_FAVORITES),
  // toggleFavorite espera el ID en el body
  toggleFavorite: (postId) => apiClient.post(API_ROUTES.TOGGLE_FAVORITE, { publicacion_id: postId }),
  // checkFavorite usa el ID en la URL
  checkFavorite: (postId) => apiClient.get(API_ROUTES.CHECK_FAVORITE(postId)),
};

// Servicio de Subida de Imágenes
export const uploadService = {
  uploadImage: (formData) => apiClient.post(API_ROUTES.UPLOAD_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadImageRegistration: (formData) => apiClient.post(API_ROUTES.UPLOAD_IMAGE_REGISTRATION, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Servicio de Usuarios (si es necesario)
export const userService = {
    getUserById: (id) => apiClient.get(API_ROUTES.GET_USER_BY_ID(id)),
    // Podrías añadir aquí getProfile, updateProfile si prefieres tenerlo separado de authService
};


export default apiClient; // Exportar la instancia configurada por si se necesita directamente
