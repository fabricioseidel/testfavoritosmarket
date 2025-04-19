/**
 * Centralized API route definitions.
 */
export const API_ROUTES = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile', // GET profile
  UPDATE_PROFILE: '/auth/profile', // PUT profile update

  // Posts
  GET_ALL_POSTS: '/posts',
  GET_POST_BY_ID: (id) => `/posts/${id}`,
  CREATE_POST: '/posts/create-post', // Asegúrate que esta es la ruta correcta en postRoutes.js
  UPDATE_POST: (id) => `/posts/update/${id}`, // Asegúrate que esta es la ruta correcta en postRoutes.js
  DELETE_POST: (id) => `/posts/${id}`,
  GET_USER_POSTS: '/posts/user-posts', // Ruta para obtener posts del usuario logueado
  SEARCH_POSTS: '/posts/search', // q=searchTerm
  CLAIM_POST: (postId) => `/posts/claim/${postId}`,

  // Categories
  GET_ALL_CATEGORIES: '/categories',
  GET_CATEGORY_BY_ID: (id) => `/categories/${id}`,

  // Favorites
  GET_FAVORITES: '/favorites',
  TOGGLE_FAVORITE: '/favorites', // POST request with { publicacion_id } in body
  CHECK_FAVORITE: (postId) => `/favorites/check/${postId}`, // GET request

  // Image Upload
  UPLOAD_IMAGE: '/upload', // Ruta para subir imágenes (ajusta si es diferente)
  UPLOAD_IMAGE_REGISTRATION: '/upload/register', // Ruta específica para registro si existe

  // Users (si necesitas obtener datos públicos de otros usuarios)
  GET_USER_BY_ID: (id) => `/users/${id}`,
};

// Base URL de la API (ajusta según tu configuración)
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'; // Usa variable de entorno o default
