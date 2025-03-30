const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Extraer el token del encabezado Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No se proporcionó un token de autenticación válido.' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Configurar el usuario autenticado en req.user
    console.log('Token verificado correctamente:', decoded); // Log para depuración

    next(); // Continuar con la siguiente función de middleware o controlador
  } catch (err) {
    console.error('Error al verificar el token:', err.message);
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;