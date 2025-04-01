const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear una nueva publicación (protegida)
router.post('/create-post', authMiddleware, postController.createPost);

// Obtener publicaciones del usuario autenticado (protegida)
router.get('/user-posts', authMiddleware, postController.getUserPosts);

// Obtener todas las publicaciones (público)
router.get('/', postController.getAllPosts);

// Obtener el detalle de una publicación por ID (público)
router.get('/:id', postController.getPostById);

module.exports = router;