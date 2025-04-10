const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// Agregar la ruta de búsqueda antes de las rutas con parámetros
router.get('/search', postController.searchPosts);

// Reordenar las rutas para evitar conflictos
router.get('/user/posts', authMiddleware, postController.getUserPosts); // Esta ruta debe ir primero
router.get('/:id', postController.getPostById);
router.get('/', postController.getAllPosts);
router.post('/', authMiddleware, postController.createPost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;