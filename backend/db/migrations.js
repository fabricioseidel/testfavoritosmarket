const pool = require('../db'); // Asegúrate que la ruta a db.js sea correcta

const createTables = async () => {
  // --- Definir las sentencias SQL para crear las tablas ---
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      foto_perfil VARCHAR(255),
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL
    );
  `;

  const createPostsTable = `
    CREATE TABLE IF NOT EXISTS publicaciones (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      precio NUMERIC(10, 2) NOT NULL,
      imagen VARCHAR(255),
      categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL, -- O ON DELETE CASCADE si prefieres eliminar posts al borrar categoría
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE, -- Eliminar posts si se borra el usuario
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createFavoritesTable = `
    CREATE TABLE IF NOT EXISTS favoritos (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
      fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (usuario_id, publicacion_id) -- Un usuario no puede tener la misma publicación dos veces en favoritos
    );
  `;
  // --- Fin de las definiciones SQL ---

  try {
    console.log('Ejecutando migraciones de base de datos...');
    // Ejecutar las consultas usando las constantes definidas arriba
    await pool.query(createUsersTable);
    await pool.query(createCategoriesTable);
    await pool.query(createPostsTable);
    await pool.query(createFavoritesTable);
    console.log('✅ Tablas creadas o ya existentes.');
  } catch (err) {
    console.error('❌ Error al crear las tablas:', err);
    throw err; // Propagar el error para detener el inicio si falla
  }
};

// Función para insertar categorías por defecto si no existen
const seedCategories = async () => {
  const defaultCategories = [
    { id: 1, nombre: 'Camisetas' },
    { id: 2, nombre: 'Pantalones' },
    { id: 3, nombre: 'Vestidos' },
    { id: 4, nombre: 'Faldas' },
    { id: 5, nombre: 'Chaquetas y Abrigos' },
    { id: 6, nombre: 'Zapatos' },
    { id: 7, nombre: 'Accesorios' },
    { id: 8, nombre: 'Ropa Interior' },
    { id: 9, nombre: 'Ropa Deportiva' },
    { id: 10, nombre: 'Otros' }
  ];

  try {
    console.log('Verificando/Poblando categorías por defecto...');
    for (const category of defaultCategories) {
      // Intentar insertar ignorando si ya existe por el UNIQUE constraint
      await pool.query(
        `INSERT INTO categorias (id, nombre) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [category.id, category.nombre]
      );
       // Asegurar que la secuencia del ID esté actualizada si insertamos manualmente IDs
       // Esto es importante si alguna vez se inserta una categoría sin ID específico después
       await pool.query(`SELECT setval(pg_get_serial_sequence('categorias', 'id'), GREATEST(MAX(id), $1)) FROM categorias`, [category.id]);
    }
    const { rows } = await pool.query('SELECT COUNT(*) FROM categorias');
    console.log(`✅ Categorías verificadas/pobladas. Total en BD: ${rows[0].count}`);
  } catch (err) {
    console.error('❌ Error al poblar categorías:', err);
    // No lanzamos error aquí para permitir que el servidor inicie,
    // pero sí logueamos el problema.
  }
};

module.exports = { createTables, seedCategories }; // Exportar ambas funciones
