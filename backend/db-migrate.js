const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigrations() {
  console.log('Ejecutando migraciones de base de datos...');
  
  try {
    // Verificar si ya existen las tablas
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('Las tablas ya existen, omitiendo migraciones.');
      return;
    }
    
    // Leer archivo SQL de esquema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ El archivo schema.sql no existe en la ruta: ${schemaPath}`);
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar script de esquema
    await pool.query(schema);
    console.log('✅ Migraciones completadas exitosamente.');
    
  } catch (error) {
    // Si el error es por tablas que ya existen, no es crítico
    if (error.code === '23505') {
      console.log('Las tablas ya existen, omitiendo migraciones.');
      return;
    }
    
    console.error('Error en las migraciones:', error);
    // No hacemos process.exit(1) para que el servidor pueda iniciar de todos modos
  }
}

module.exports = runMigrations;
