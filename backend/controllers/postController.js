const pool = require('../db');

// Crear una nueva publicación
exports.createPost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error('❌ createPost - No hay usuario autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { titulo, descripcion, precio, categoria_id } = req.body;
    let imagen = req.file ? `/uploads/${req.file.filename}` : null;

    console.log('📝 createPost - Datos recibidos:', {
      titulo, descripcion, precio, categoria_id, 
      imagen: imagen ? '[IMAGEN]' : 'null',
      usuario_id: req.user.id
    });

    if (!titulo || !descripcion || !precio || !categoria_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO publicaciones (titulo, descripcion, precio, imagen, categoria_id, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [titulo, descripcion, precio, imagen, categoria_id, req.user.id]
    );

    console.log(`✅ createPost - Publicación creada ID: ${result.rows[0].id}, Usuario: ${result.rows[0].usuario_id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al crear publicación:', err);
    res.status(500).json({ error: 'Error al crear la publicación' });
  }
};

// Obtener todas las publicaciones (con nombre de categoría)
exports.getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       ORDER BY p.fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener todas las publicaciones:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener el detalle de una publicación por ID (con nombre de categoría y nombre de usuario)
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('ID recibido en la solicitud:', id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID de la publicación debe ser un número válido.' });
    }

    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre, u.nombre as usuario_nombre
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    console.log('Resultado de la consulta SQL:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    const post = result.rows[0];
    if (post.precio) {
      post.precio = parseFloat(post.precio);
    }

    const postData = {
      ...post,
      categoria: post.categoria_nombre || 'Sin categoría'
    };

    console.log('Datos que se enviarán al frontend:', JSON.stringify(postData, null, 2));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(postData);
  } catch (err) {
    console.error('Error al obtener el detalle de la publicación:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener publicaciones del usuario autenticado
exports.getUserPosts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const userId = req.user.id;
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.usuario_id = $1
       ORDER BY p.fecha_creacion DESC`,
      [userId]
    );

    console.log('Datos recuperados de BD con categorías:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las publicaciones del usuario:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar una publicación
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const checkOwner = await pool.query(
      'SELECT usuario_id FROM publicaciones WHERE id = $1',
      [id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (checkOwner.rows[0].usuario_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación' });
    }

    await pool.query('DELETE FROM favoritos WHERE publicacion_id = $1', [id]);

    const result = await pool.query(
      'DELETE FROM publicaciones WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No se pudo eliminar la publicación o no se encontró' });
    }

    res.json({ message: 'Publicación eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar la publicación:', err.message);
    if (err.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar la publicación porque tiene referencias asociadas (ej. en carritos de compra). Contacta al administrador.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Buscar publicaciones
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'El término de búsqueda es obligatorio' });
    }

    console.log('🔍 Buscando publicaciones con:', q);

    const searchTerm = `%${q}%`;
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM publicaciones p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.titulo ILIKE $1 OR p.descripcion ILIKE $1
       ORDER BY p.fecha_creacion DESC`,
      [searchTerm]
    );

    console.log(`✅ Encontradas ${result.rows.length} publicaciones`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error en searchPosts:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar una publicación
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, categoria_id, imagen } = req.body;
    const userId = req.user.id;

    console.log(`⌛ Actualizando publicación ${id} para usuario ${userId}`);
    console.log('Datos recibidos:', req.body);

    if (!titulo || !descripcion || !precio || !categoria_id) {
      console.log('Validación fallida:', { titulo, descripcion, categoria_id, precio, imagen });
      return res.status(400).json({ error: 'Todos los campos son obligatorios (excepto imagen).' });
    }

    const checkOwner = await pool.query(
      'SELECT usuario_id FROM publicaciones WHERE id = $1',
      [id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    if (checkOwner.rows[0].usuario_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta publicación.' });
    }

    const result = await pool.query(
      `UPDATE publicaciones 
       SET titulo = $1, descripcion = $2, precio = $3, categoria_id = $4, imagen = $5, fecha_actualizacion = NOW()
       WHERE id = $6 AND usuario_id = $7
       RETURNING *`,
      [titulo, descripcion, precio, categoria_id, imagen, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se pudo actualizar la publicación o no se encontró' });
    }

    console.log('✅ Publicación actualizada correctamente:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al actualizar la publicación:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};