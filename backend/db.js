const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres', // Cambia esto si tu usuario es diferente
  host: 'localhost',
  database: 'marketplace', // Asegúrate de que esta base de datos exista
  password: 'Sergio061193', // Cambia esto por tu contraseña
  port: 5432,
});

module.exports = pool;