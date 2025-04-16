const jwt = require('jsonwebtoken');
const pool = require('../db');

/**
 * Middleware de autenticación que verifica el token JWT y establece req.user
 */
const auth = async (req, res, next) => {
  // Log para depuración inicial
  console.log('🔒 Auth middleware - Inicio de verificación de token');
  
  try {
    // Verificar header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔒 Auth middleware - No se encontró token Bearer');
      return res.status(401).json({ error: 'Acceso no autorizado, token no proporcionado' });
    }

    // Extraer token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('🔒 Auth middleware - Token vacío tras split');
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      // Clave secreta para JWT
      const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';
      
      // Verificar y decodificar token
      const decoded = jwt.verify(token, secretKey);
      console.log(`🔒 Auth middleware - Token verificado: userId=${decoded.userId}`);
      
      if (!decoded.userId) {
        console.log('🔒 Auth middleware - Token no contiene userId');
        return res.status(401).json({ error: 'Token malformado' });
      }
      
      // Buscar usuario en la base de datos con un SELECT explícito
      const result = await pool.query(
        'SELECT id, email, nombre FROM usuarios WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        console.log(`🔒 Auth middleware - Usuario ID ${decoded.userId} no encontrado`);
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }
      
      // CRÍTICO: Asignar el usuario al request de forma explícita y verificable
      req.user = {
        id: Number(result.rows[0].id), // Asegurar que es un número
        email: result.rows[0].email,
        nombre: result.rows[0].nombre
      };
      
      console.log(`🔒 Auth middleware - Usuario establecido: ${JSON.stringify(req.user)}`);
      
      // VERIFICACIÓN ADICIONAL - Asegurar que req.user persiste
      if (!req.user || !req.user.id) {
        console.error('🔒 Auth middleware - req.user no fue establecido correctamente');
        return res.status(500).json({ error: 'Error en middleware de autenticación' });
      }
      
      // Continuar con la cadena de middleware
      next();
    } catch (error) {
      console.error('🔒 Auth middleware - Error de token:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      
      return res.status(401).json({ error: 'Token inválido' });
    }
  } catch (err) {
    console.error('🔒 Auth middleware - Error general:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = auth;
