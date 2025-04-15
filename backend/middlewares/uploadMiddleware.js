const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Directorio de uploads creado en: ${uploadDir}`);
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Log de la operación
    console.log(`Guardando archivo '${file.originalname}' en: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único basado en timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const newFilename = uniqueSuffix + extension;
    console.log(`Renombrando archivo a: ${newFilename}`);
    cb(null, newFilename);
  }
});

// Filtrar archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Por favor, usa JPG, PNG, GIF o WEBP.'), false);
  }
};

// Crear el middleware de carga
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

module.exports = upload;
