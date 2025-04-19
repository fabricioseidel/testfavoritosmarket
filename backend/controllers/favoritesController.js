const pool = require('../db');

// Alternar una publicación en favoritos (agregar o eliminar)
exports.toggleFavorite = async (req, res) => {
  try {
    const { publicacion_id } = req.body;
    const usuario_id = req.user.id;

    console.log(`favoritesController: Toggle favorito para usuario ID: ${usuario_id}, publicacion ID: ${publicacion_id}`);

    if (!publicacion_id) {
      console.error('toggleFavorite: Falta publicacion_id en el body');
      return res.status(400).json({ error: 'El ID de la publicación es obligatorio.' });
    }

    // Verificar si ya existe
    const check = await pool.query(
      'SELECT id FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
      [usuario_id, publicacion_id]
    );

    if (check.rows.length > 0) {
      // Existe, eliminar
      await pool.query(
        'DELETE FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
        [usuario_id, publicacion_id]
      );
      console.log(`favoritesController: Publicación ${publicacion_id} eliminada de favoritos para usuario ${usuario_id}.`);
      return res.json({ isFavorite: false, message: 'Publicación eliminada de favoritos' });
    } else {
      // No existe, insertar
      await pool.query(
        'INSERT INTO favoritos (usuario_id, publicacion_id) VALUES ($1, $2)',
        [usuario_id, publicacion_id]
      );
      console.log(`favoritesController: Publicación ${publicacion_id} añadida a favoritos para usuario ${usuario_id}.`);
      return res.status(201).json({ isFavorite: true, message: 'Publicación añadida a favoritos' });
    }
  } catch (err) {
    console.error('Error en toggleFavorite:', err.message);
    // Manejar posible error de FK si publicacion_id no existe
    if (err.code === '23503') { // FK violation
      return res.status(404).json({ error: 'La publicación especificada no existe.' });
    }
    res.status(500).json({ error: 'Error al alternar el estado de favorito' });
  }
};

// Obtener las publicaciones favoritas del usuario
exports.getFavorites = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    console.log(`favoritesController: Obteniendo favoritos para usuario ID: ${usuario_id}`);

    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM publicaciones p
       INNER JOIN favoritos f ON p.id = f.publicacion_id
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE f.usuario_id = $1
       ORDER BY f.fecha_agregado DESC`, // Ordenar por fecha en que se agregó a favoritos
      [usuario_id]
    );

    console.log(`favoritesController: Encontrados ${result.rows.length} favoritos.`);
    // Asegurarse de que el precio se devuelve como número
    const favoritesWithParsedPrice = result.rows.map(fav => ({
      ...fav,
      precio: fav.precio ? parseFloat(fav.precio) : null
    }));

    res.json(favoritesWithParsedPrice);
  } catch (err) {
    console.error('Error en getFavorites:', err.message);
    res.status(500).json({ error: 'Error al obtener los favoritos' });
  }
};

// Verificar si una publicación es favorita del usuario
exports.checkFavorite = async (req, res) => {
  try {
    const { postId } = req.params;
    const usuario_id = req.user.id;

    console.log(`favoritesController: Verificando favorito para usuario ID: ${usuario_id}, postId: ${postId}`);

    // Validar que postId sea un número válido antes de consultar
    if (!postId || isNaN(parseInt(postId))) {
      console.error('checkFavorite: postId inválido o faltante en la URL');
      return res.status(400).json({ error: 'El ID de la publicación en la URL es inválido.' });
    }
    const publicacion_id = parseInt(postId);

    const check = await pool.query(
      'SELECT id FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
      [usuario_id, publicacion_id]
    );

    const isFavorite = check.rows.length > 0;
    console.log(`favoritesController: Publicación ${publicacion_id} ${isFavorite ? 'ES' : 'NO ES'} favorita para usuario ${usuario_id}.`);
    res.json({ isFavorite: isFavorite });
  } catch (err) {
    console.error('Error en checkFavorite:', err.message);
    res.status(500).json({ error: 'Error al verificar el estado de favorito' });
  }
};
