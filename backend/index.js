require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const pool = require('./db'); // Importar el archivo db.js
const favoriteRoutes = require('./routes/favoriteRoutes'); // Nombre estandarizado
const categoryRoutes = require('./routes/categoryRoutes'); // Importar las rutas de categorías
const authRoutes = require('./routes/authRoutes'); // Importar las rutas de autenticación
const userRoutes = require('./routes/userRoutes'); // Importar las rutas de usuarios
const postRoutes = require('./routes/postRoutes'); // Importar las rutas de publicaciones
const profileRoutes = require('./routes/profileRoutes'); // Importar las rutas de perfil
const uploadRoutes = require('./routes/uploadRoutes'); // Importar las rutas de cargas

// Verificar si JWT_SECRET está configurado
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET no está configurado en el archivo .env');
  process.exit(1); // Detener el servidor si falta JWT_SECRET
}

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://favoritosmarket.netlify.app', 'https://favoritosmarket-api.onrender.com'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configurar carpeta de uploads como directorio estático
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Prueba de conexión a la base de datos
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos:', res.rows[0]);
  }
});

// Asegurarse de que la ruta de archivos estáticos tiene los permisos correctos
const uploadPath = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`Directorio de uploads creado en: ${uploadPath}`);
}

// Middleware para servir archivos estáticos con encabezados adecuados
app.use('/uploads', (req, res, next) => {
  // Añadir cache control para imágenes
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
}, express.static(path.join(__dirname, 'public/uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoriteRoutes); // Usando el nombre correcto
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes); // Nueva ruta para cargas

// Middleware para servir el frontend desde build en producción
if (process.env.NODE_ENV === 'production') {
  // Prioridad a las rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/upload', uploadRoutes);

  // Servir archivos estáticos desde la carpeta build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Todas las demás solicitudes GET no manejadas se envían a la aplicación React
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // En desarrollo, solo configuramos las rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/upload', uploadRoutes);
}

// Importar y ejecutar migraciones
const runMigrations = require('./db-migrate');

// Migraciones y luego iniciar el servidor
runMigrations().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Error al iniciar la aplicación:', err);
});