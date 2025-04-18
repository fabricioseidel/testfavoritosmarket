// Configuración centralizada para la aplicación frontend

// Determinar la URL base de la API según el entorno
const getApiBaseUrl = () => {
  // Prioridad: Variable de entorno específica de React
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Entorno de producción (Netlify, Vercel, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Reemplaza 'node-backend-market.onrender.com' con el nombre real de tu servicio en Render si es diferente
    return 'https://node-backend-market.onrender.com/api';
  }
  // Entorno de desarrollo local
  return 'http://localhost:5000/api'; // Asegúrate que el puerto coincida con tu backend local
};

const appConfig = {
  // Configuración de la API
  api: {
    baseUrl: getApiBaseUrl(),
    timeout: 10000, // Tiempo de espera para las solicitudes API (en ms)
  },

  // Configuración de autenticación
  auth: {
    tokenStorageKey: 'user', // Clave para guardar datos de usuario/token en localStorage
    tokenHeader: 'Authorization', // Nombre del encabezado para enviar el token
    tokenPrefix: 'Bearer ', // Prefijo para el token en el encabezado
  },

  // Configuración de UI
  ui: {
    notificationDuration: 3000, // Duración predeterminada de las notificaciones (en ms)
    itemsPerPage: 12, // Número de elementos por página en listados
  },

  // Configuración de carga de archivos
  upload: {
    maxSize: 5 * 1024 * 1024, // Tamaño máximo de archivo (5MB)
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], // Tipos MIME permitidos
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'], // Extensiones permitidas
    defaultImage: '/placeholder-image.png', // Imagen por defecto o fallback
  },

  // Otras configuraciones
  appName: 'FavoritosMarket',
  appVersion: '1.0.0',
};

// Log para verificar la URL base en diferentes entornos
console.log(`[App Config] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[App Config] REACT_APP_API_URL: ${process.env.REACT_APP_API_URL}`);
console.log(`[App Config] API Base URL: ${appConfig.api.baseUrl}`);


export default appConfig;
