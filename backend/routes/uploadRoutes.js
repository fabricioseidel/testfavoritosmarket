const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middlewares/uploadMiddleware'); // Importar upload y handleMulterError
const cloudinary = require('../config/cloudinaryConfig'); // Importar config de Cloudinary
const streamifier = require('streamifier'); // Importar streamifier
const auth = require('../middleware/authMiddleware'); // Mantener authMiddleware

// Función helper para subir a Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "favoritosmarket" }, // Puedes organizar en carpetas
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Ruta para subir imágenes que requiere autenticación
router.post('/image', auth, upload.single('image'), handleMulterError, async (req, res) => { // Añadir handleMulterError
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    console.log(`Subiendo archivo a Cloudinary (autenticado): ${req.file.originalname}`);
    const result = await uploadToCloudinary(req.file.buffer);
    console.log('Archivo subido a Cloudinary:', result.secure_url);

    res.json({
      success: true,
      fileUrl: result.secure_url // <<< Devolver URL de Cloudinary
    });
  } catch (error) {
    console.error('Error al subir la imagen a Cloudinary:', error);
    res.status(500).json({ error: 'Error interno al subir la imagen.' });
  }
});

// Ruta para subir imágenes durante el registro (sin autenticación)
router.post('/registration-image', upload.single('image'), handleMulterError, async (req, res) => { // Añadir handleMulterError
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    console.log(`Subiendo archivo a Cloudinary (registro): ${req.file.originalname}`);
    const result = await uploadToCloudinary(req.file.buffer);
    console.log('Archivo subido a Cloudinary:', result.secure_url);

    res.json({
      success: true,
      fileUrl: result.secure_url // <<< Devolver URL de Cloudinary
    });
  } catch (error) {
    console.error('Error al subir la imagen de registro a Cloudinary:', error);
    res.status(500).json({ error: 'Error interno al subir la imagen.' });
  }
});

module.exports = router;
