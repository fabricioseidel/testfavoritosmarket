import axiosInstance from '../axiosConfig';

// Usar la instancia configurada en lugar de crear una nueva
const api = axiosInstance;

// Función de utilidad para depurar
const testApiConnection = async () => {
  try {
    const response = await api.get('/');
    console.log('Conexión API exitosa:', response.data);
    return true;
  } catch (error) {
    console.error('Error al conectar con API:', error);
    return false;
  }
};

// Ejecutar prueba durante la inicialización
testApiConnection();

export default api;
