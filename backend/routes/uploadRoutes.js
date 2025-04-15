const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para subir una sola imagen
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Construir URL del archivo
    const protocol = req.protocol;
    const host = req.get('host');
    const filePath = `/uploads/${req.file.filename}`;
    const fileUrl = `${protocol}://${host}${filePath}`;

    res.json({
      success: true,
      filePath: filePath,
      fileUrl: fileUrl
    });
  } catch (error) {
    console.error('Error en la carga de archivos:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

module.exports = router;
