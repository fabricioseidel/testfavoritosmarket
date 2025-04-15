const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, foto_perfil } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO usuarios (email, password, nombre, foto_perfil) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, nombre, foto_perfil || null]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
    }

    const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: user.rows[0] });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

// Obtener el perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await pool.query('SELECT id, nombre, email, foto_perfil FROM usuarios WHERE id = $1', [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error('Error al obtener el perfil del usuario:', err);
    res.status(500).json({ error: 'Error al obtener el perfil del usuario.' });
  }
};

// Actualizar el perfil del usuario
exports.updateProfile = async (req, res) => {
  try {
    const { nombre, email, foto_perfil } = req.body;
    const userId = req.user.id;

    console.log('Actualizando perfil de usuario:', userId);
    console.log('Datos recibidos:', { nombre, email, foto_perfil });

    // Validación básica
    if (!nombre || !email) {
      return res.status(400).json({ error: 'El nombre y email son obligatorios' });
    }

    // Verificar si el email ya existe (y no pertenece al usuario actual)
    const emailCheck = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Este email ya está en uso por otro usuario' });
    }

    // Actualizar el perfil
    const updatedUser = await pool.query(
      'UPDATE usuarios SET nombre = $1, email = $2, foto_perfil = $3 WHERE id = $4 RETURNING id, nombre, email, foto_perfil',
      [nombre, email, foto_perfil, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Log para verificar los datos actualizados
    console.log('Perfil actualizado exitosamente:', updatedUser.rows[0]);
    
    // Actualizar los datos del usuario en la sesión si existe
    req.user = {
      ...req.user,
      nombre: nombre,
      email: email,
      foto_perfil: foto_perfil
    };

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

// Crear una publicación (protegida)
exports.createPost = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, precio, imagen } = req.body;

    if (!titulo || !descripcion || !categoria || !precio || !imagen) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const newPost = await pool.query(
      'INSERT INTO publicaciones (titulo, descripcion, categoria, precio, imagen, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, descripcion, categoria, precio, imagen, req.user.id]
    );

    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    console.error('Error al crear la publicación:', err);
    res.status(500).json({ error: 'Error al crear la publicación.' });
  }
};

// Obtener las publicaciones del usuario autenticado
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await pool.query('SELECT * FROM publicaciones WHERE usuario_id = $1', [req.user.id]);

    res.json(posts.rows);
  } catch (err) {
    console.error('Error al obtener las publicaciones del usuario:', err);
    res.status(500).json({ error: 'Error al obtener las publicaciones del usuario.' });
  }
};

// Obtener los datos de un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query('SELECT id, nombre, email, foto_perfil FROM usuarios WHERE id = $1', [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error('Error al obtener el usuario:', err);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
};