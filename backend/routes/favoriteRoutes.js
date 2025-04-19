const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Corregido path a middleware
const favoritesController = require('../controllers/favoritesController');

// Ruta para obtener todos los favoritos del usuario (GET /api/favorites)
router.get('/', authMiddleware, favoritesController.getFavorites);

// Ruta para alternar un favorito (POST /api/favorites)
router.post('/', authMiddleware, favoritesController.toggleFavorite);

// Ruta para verificar si un post es favorito (GET /api/favorites/check/:postId)
// *** CORRECCIÓN: Cambiar :id a :postId ***
router.get('/check/:postId', authMiddleware, favoritesController.checkFavorite);

module.exports = router;
