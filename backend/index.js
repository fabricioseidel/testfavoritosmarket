require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const pool = require('./db'); // Importar el archivo db.js
const favoritesRoutes = require('./routes/favoritesRoutes');

const authRoutes = require('./routes/authRoutes'); // Importar las rutas de autenticación
const userRoutes = require('./routes/userRoutes'); // Importar las rutas de usuarios
const postRoutes = require('./routes/postRoutes'); // Importar las rutas de publicaciones
const profileRoutes = require('./routes/profileRoutes'); // Importar las rutas de perfil

// Mejora en verificación de variables esenciales
['JWT_SECRET', 'DB_PASSWORD'].forEach(key => {
  if (!process.env[key]) {
    console.error(`Error: ${key} no está configurado`);
    process.exit(1);
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Prueba de conexión a la base de datos
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos:', res.rows[0]);
  }
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoritesRoutes);

// Middleware para servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Ruta para manejar cualquier otra solicitud (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Mejora en manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Error del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));