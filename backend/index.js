require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser'); // Importar cookie-parser
const app = express();
const pool = require('./db'); // Importar el archivo db.js
const favoriteRoutes = require('./routes/favoriteRoutes'); // Usar solo esta versión
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { createTables, seedCategories } = require('./db/migrations'); // Importar ambas

// Verificar si JWT_SECRET está configurado
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET no está configurado en el archivo .env');
  process.exit(1); // Detener el servidor si falta JWT_SECRET
}

// Middlewares

// Define allowed origins based on environment
const allowedOrigins = [
  'http://localhost:3000', // Frontend local
  'https://favoritosmarket.netlify.app', // URL Netlify principal (ejemplo)
  'https://comforting-halva-178cd0.netlify.app', // Otra URL Netlify (ejemplo)
  // Puedes añadir la URL específica de tu despliegue de Netlify aquí
  // o leerla desde una variable de entorno: process.env.FRONTEND_URL
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); // Añadir middleware para procesar cookies

// Agregar un middleware para depuración de rutas
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Depuración específica para la ruta de favoritos
app.use('/api/favorites', (req, res, next) => {
  console.log('👉 Interceptando solicitud a /api/favorites');
  console.log('👉 Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method === 'POST') {
    console.log('👉 Cuerpo de la solicitud POST:', req.body);
  }
  next();
});

// ===================== RUTAS DE LA API =====================
// Configurar todas las rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

// ===================== MANEJO DE RUTAS PRINCIPALES =====================
// Ruta raíz - devolver información sobre la API
app.get('/', (req, res) => {
  res.json({
    message: 'FavoritosMarket API',
    // frontend_url: process.env.FRONTEND_URL || 'https://favoritosmarket.netlify.app', // Opcional: mostrar URL frontend
    api_version: '1.0.0',
    endpoints: [
      '/api/auth', 
      '/api/users', 
      '/api/posts',
      '/api/profile', 
      '/api/favorites', 
      '/api/categories'
    ]
  });
});

// Capturar todas las demás rutas no manejadas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: 'La ruta solicitada no existe en esta API',
    suggestion: 'Visita la ruta principal / para más información'
  });
});

// --- Inicio del Servidor ---
const startServer = async () => {
  try {
    // 1. Verificar conexión a BD
    const dbCheck = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos establecida correctamente:', dbCheck.rows[0]);

    // 2. Ejecutar migraciones para crear tablas
    await createTables();

    // 3. Poblar categorías por defecto (DESPUÉS de crear tablas)
    await seedCategories();

    // 4. Iniciar el servidor Express
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1); // Salir si hay un error crítico al inicio
  }
};

startServer();