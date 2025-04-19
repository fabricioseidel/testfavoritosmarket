const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Asegúrate que dotenv se cargue

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Siempre usar HTTPS
});

console.log('Cloudinary Configurado con Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '***' : 'NO CONFIGURADO');

module.exports = cloudinary;
