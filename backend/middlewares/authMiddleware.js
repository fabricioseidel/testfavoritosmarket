const jwt = require('jsonwebtoken');
const pool = require('../db');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔒 Auth middleware - Inicio de verificación de token');
    
    // Obtener el token desde header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔒 Auth middleware - No se encontró token o formato inválido');
      return res.status(401).json({ error: 'No autorizado - Token no proporcionado' });
    }
    
    // Extraer el token del header (Bearer TOKEN)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('🔒 Auth middleware - Token vacío');
      return res.status(401).json({ error: 'No autorizado - Token vacío' });
    }
    
    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
      console.log('🔒 Auth middleware - Token verificado:', `userId=${decoded.userId}`);
      
      // Obtener información del usuario desde la base de datos
      const result = await pool.query(
        'SELECT id, email, nombre FROM usuarios WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        console.log('🔒 Auth middleware - Usuario no encontrado en BD');
        return res.status(401).json({ error: 'No autorizado - Usuario no encontrado' });
      }
      
      // Agregar información del usuario al objeto req
      req.user = result.rows[0];
      console.log('🔒 Auth middleware - Usuario establecido:', JSON.stringify(req.user));
      
      next();
    } catch (jwtError) {
      console.log('🔒 Auth middleware - Error al verificar token:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'No autorizado - Token expirado' });
      }
      return res.status(401).json({ error: 'No autorizado - Token inválido' });
    }
  } catch (err) {
    console.error('🔒 Auth middleware - Error general:', err);
    return res.status(500).json({ error: 'Error del servidor al autenticar' });
  }
};

module.exports = authMiddleware;