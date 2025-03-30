const pool = require('../db');

// Crear una nueva publicación
exports.createPost = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, precio, imagen } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (!titulo || !descripcion || !categoria || !precio || !imagen) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    console.log('Datos enviados a la base de datos:', { titulo, descripcion, categoria, precio, imagen, usuario_id: req.user.id });

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

// Obtener todas las publicaciones
exports.getAllPosts = async (req, res) => {
  try {
    console.log('📤 Intentando obtener publicaciones...');

    const result = await pool.query('SELECT * FROM publicaciones');

    console.log('✅ Publicaciones obtenidas:', result.rows.length, 'registro(s)');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en getAllPosts:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: 'Error interno al obtener publicaciones' });
  }
};

// Obtener el detalle de una publicación por ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('ID recibido en la solicitud:', id); // Log para depuración

    // Verificar que el ID sea un número válido
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID de la publicación debe ser un número válido.' });
    }

    const post = await pool.query(
      'SELECT * FROM publicaciones WHERE id = $1',
      [id]
    );

    console.log('Resultado de la consulta SQL:', post.rows); // Log para depuración

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    res.json(post.rows[0]);
  } catch (err) {
    console.error('Error al obtener el detalle de la publicación:', err); // Log del error
    res.status(500).json({ error: 'Error al obtener el detalle de la publicación.' });
  }
};

// Obtener publicaciones del usuario autenticado
exports.getUserPosts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const posts = await pool.query(
      'SELECT id, titulo, descripcion, categoria, precio, imagen FROM publicaciones WHERE usuario_id = $1',
      [req.user.id]
    );

    res.json(posts.rows);
  } catch (err) {
    console.error('Error al obtener las publicaciones del usuario:', err);
    res.status(500).json({ error: 'Error al obtener las publicaciones del usuario.' });
  }
};