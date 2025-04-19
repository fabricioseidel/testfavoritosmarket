const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
// --- CAMBIO TEMPORAL ---
// Intentar importar el otro controlador, asumiendo que existe en el repo
const favoriteController = require('../controllers/favoritesController'); // Cambiado de favoriteController a favoritesController

// Ruta para obtener todos los favoritos del usuario (GET /api/favorites)
router.get('/', auth, favoriteController.getFavorites);

// Ruta para alternar un favorito (POST /api/favorites)
// Cambiado para que coincida con la implementación de toggleFavorite que espera publicacion_id en el body
router.post('/', auth, favoriteController.toggleFavorite);

// Ruta para verificar si un post es favorito (GET /api/favorites/check/:postId)
// Asegúrate que el parámetro se llama postId como en el controlador checkFavorite
router.get('/check/:postId', auth, favoriteController.checkFavorite);

module.exports = router;
