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

// Rutas para búsqueda y actualización
router.get('/search', postController.searchPosts);
router.put('/update/:id', authMiddleware, postController.updatePost);
// También podemos habilitar la ruta con formato tradicional
router.put('/:id', authMiddleware, postController.updatePost);

// Obtener el detalle de una publicación por ID (público)
router.get('/:id', postController.getPostById);

// Eliminar una publicación (protegida)
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;