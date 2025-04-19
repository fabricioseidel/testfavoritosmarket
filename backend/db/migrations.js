const pool = require('../db'); // Asegúrate que la ruta a db.js sea correcta

// ... (código existente para crear tablas) ...

const createTables = async () => {
  // ... (código existente para crear tablas usuarios, categorias, publicaciones, favoritos) ...
  // Asegúrate que la tabla categorias se crea ANTES de publicaciones
  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL
    );
  `;
  // ... resto de las tablas ...

  try {
    console.log('Ejecutando migraciones de base de datos...');
    await pool.query(createUsersTable);
    await pool.query(createCategoriesTable); // Asegurar que se crea
    await pool.query(createPostsTable);
    await pool.query(createFavoritesTable);
    console.log('✅ Tablas creadas o ya existentes.');
  } catch (err) {
    console.error('❌ Error al crear las tablas:', err);
    throw err; // Propagar el error para detener el inicio si falla
  }
};

// --- NUEVA FUNCIÓN ---
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


// Modificar la exportación si es necesario, o simplemente exportar ambas
module.exports = { createTables, seedCategories }; // Exportar ambas funciones
