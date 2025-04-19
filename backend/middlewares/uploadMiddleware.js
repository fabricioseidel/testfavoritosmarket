const multer = require('multer');
const path = require('path');

// --- CAMBIO: Usar almacenamiento en memoria ---
const storage = multer.memoryStorage();

// Filtrar archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  // Validación estricta de tipo MIME
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Formato de archivo no soportado. Por favor, usa JPG, PNG, GIF o WEBP.'), false);
  }
  
  // Validación adicional de extensión
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  if (!allowedExtensions.includes(extension)) {
    return cb(new Error('Extensión de archivo no permitida.'), false);
  }
  
  cb(null, true);
};

// Crear el middleware de carga con memoryStorage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
    files: 1 // Máximo 1 archivo por solicitud
  }
});

// Middleware para manejar errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Errores de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo de 5MB.' });
    }
    return res.status(400).json({ error: `Error en la carga: ${err.message}` });
  } else if (err) {
    // Otros errores
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, handleMulterError };
