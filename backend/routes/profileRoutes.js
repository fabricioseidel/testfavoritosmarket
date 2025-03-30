const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta protegida para obtener el perfil del usuario
router.get('/', authMiddleware, userController.getProfile);

module.exports = router;
