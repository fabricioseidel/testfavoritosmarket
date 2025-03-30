const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Asegúrate de que el archivo db.js esté en la raíz

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, foto_perfil } = req.body;

    // Validar que todos los campos estén presentes
    if (!email || !password || !nombre || !foto_perfil) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la base de datos
    const result = await pool.query(
      'INSERT INTO usuarios (email, password, nombre, foto_perfil) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, nombre, foto_perfil]
    );

    // Responder con los datos del usuario creado
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al registrar el usuario:', err); // Log para depuración
    res.status(500).json({ error: 'Error en el servidor. Por favor, inténtalo más tarde.' });
  }
};

// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que ambos campos estén presentes
    if (!email || !password) {
      return res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
    }

    // Buscar al usuario por email
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    // Verificar si el usuario existe
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Comparar la contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Log para depuración
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Responder con el token y los datos del usuario
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        foto_perfil: user.foto_perfil,
      },
    });
  } catch (err) {
    console.error('Error en el servidor:', err); // Log para depuración
    res.status(500).json({ error: 'Error en el servidor. Por favor, inténtalo más tarde.' });
  }
};