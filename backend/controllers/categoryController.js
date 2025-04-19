const pool = require('../db');

// Obtener todas las categorías
exports.getAllCategories = async (req, res) => {
  try {
    // --- IMPORTANTE: Leer desde la base de datos ---
    console.log("Obteniendo categorías desde la base de datos...");
    const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    console.log(`Enviando ${result.rows.length} categorías desde la BD.`);
    res.json(result.rows);
    // --- --- --- ---
  } catch (err) {
    console.error('Error al obtener categorías:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una categoría por ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    // Adaptar si se usa la lista hardcodeada o la base de datos
    // Ejemplo con DB:
    const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
    // Si usas la lista hardcodeada, tendrías que buscar en ella.
  } catch (err) {
    console.error('Error al obtener categoría por ID:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una nueva categoría (requiere permisos de admin idealmente)
exports.createCategory = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    const result = await pool.query(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear categoría:', err.message);
    // Manejar posible error de nombre duplicado (si hay constraint UNIQUE)
    if (err.code === '23505') { // Código de error UNIQUE VIOLATION en PostgreSQL
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar una categoría (requiere permisos de admin idealmente)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    const result = await pool.query(
      'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar categoría:', err.message);
     if (err.code === '23505') {
        return res.status(409).json({ error: 'Ya existe otra categoría con ese nombre.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar una categoría (requiere permisos de admin idealmente)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar si hay publicaciones usando esta categoría
    const checkPosts = await pool.query('SELECT id FROM publicaciones WHERE categoria_id = $1 LIMIT 1', [id]);
    if (checkPosts.rows.length > 0) {
        return res.status(409).json({ error: 'No se puede eliminar la categoría porque está siendo usada por publicaciones.' });
    }

    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
