const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// Agregar la ruta de búsqueda antes de las rutas con parámetros
router.get('/search', postController.searchPosts);

// Cambiar el orden de las rutas para evitar conflictos
router.post('/', authMiddleware, postController.createPost);  // Ruta simplificada
router.get('/user/posts', authMiddleware, postController.getUserPosts);
router.get('/:id', postController.getPostById);
router.get('/', postController.getAllPosts);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;