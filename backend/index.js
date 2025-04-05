require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const pool = require('./db'); // Actualizar la importación
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
const testDbConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a la base de datos:', result.rows[0]);
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
};

testDbConnection();

// Rutas de la API (mover antes de la ruta estática)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoritesRoutes);

// Solo usar en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

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