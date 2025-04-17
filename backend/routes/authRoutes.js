const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Importar bcryptjs correctamente

// Añadir middleware de autenticación para rutas protegidas
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, foto_perfil } = req.body;
    
    console.log('Datos de registro recibidos:', { nombre, email, password: '***', foto_perfil: foto_perfil ? 'Presente' : 'Ausente' });

    // Validar campos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el email ya está registrado
    const checkEmail = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Insertar nuevo usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, foto_perfil) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, foto_perfil',
      [nombre, email, password, foto_perfil || '']
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Intento de login recibido para:', { email, password: '***' });
    
    // Validar campos
    if (!email || !password) {
      console.log('Login fallido: campos faltantes');
      return res.status(400).json({ error: 'Por favor proporcione email y contraseña' });
    }
    
    // Buscar usuario
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    // Debug
    console.log(`Resultado de búsqueda: ${result.rows.length} usuarios encontrados`);
    
    // Verificar si el usuario existe
    if (result.rows.length === 0) {
      console.log('Login fallido: usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = result.rows[0];
    console.log('Usuario encontrado:', { id: user.id, nombre: user.nombre });
    
    // Verificar contraseña (comparación simple por ahora)
    if (password !== user.password) {
      console.log('Login fallido: contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    console.log('Contraseña verificada correctamente');
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'tu_clave_secreta_aqui',
      { expiresIn: '24h' }
    );
    
    console.log(`Token generado exitosamente para usuario ID: ${user.id}`);
    
    // Enviar respuesta
    res.json({
      token,
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      foto_perfil: user.foto_perfil || ''
    });
    
    console.log('Login exitoso, respuesta enviada');
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Ruta para obtener perfil del usuario
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Simplificar ya que req.user se asigna en el middleware
    res.json({
      id: req.user.id,
      nombre: req.user.nombre,
      email: req.user.email,
      foto_perfil: req.user.foto_perfil || ''
    });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar perfil del usuario
router.put('/profile', async (req, res) => {
  try {
    // Verificar si hay un header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso no autorizado, token no proporcionado' });
    }

    // Extraer el token del header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
      
      // Obtener los datos a actualizar
      const { nombre, foto_perfil } = req.body;
      
      // Actualizar el usuario en la base de datos
      const result = await pool.query(
        'UPDATE usuarios SET nombre = $1, foto_perfil = $2 WHERE id = $3 RETURNING id, nombre, email, foto_perfil',
        [nombre, foto_perfil, decoded.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // Devolver los datos actualizados
      res.json(result.rows[0]);
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado, por favor inicia sesión nuevamente' });
      }
      return res.status(401).json({ error: 'Token no válido' });
    }
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
