const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Agregar o eliminar una publicación de favoritos (toggle)
router.post('/', authMiddleware, favoritesController.toggleFavorite);

// Obtener todas las publicaciones favoritas del usuario
router.get('/', authMiddleware, favoritesController.getFavorites);

module.exports = router;
