import axios from 'axios'; // Mantener axios para la prueba de conexión directa
// Importar los servicios desde apiClient
import { authService, postService, categoryService, favoriteService } from '../services/apiClient';
import appConfig from '../config/appConfig'; // Importar config para la URL base

const testBackendConnection = async () => {
  try {
    // Usar la URL base de la configuración, quitando /api para probar la raíz
    const rootUrl = appConfig.api.baseUrl.replace('/api', '/');
    console.log(`Probando conexión a: ${rootUrl}`);
    const response = await axios.get(rootUrl); // Usar axios directo para la raíz
    console.log('Conexión exitosa al backend:', response.data);
    return true;
  } catch (error) {
    console.error('Error conectando al backend:', error.message);
    return false;
  }
};

/**
 * Función para probar la conexión y servicios API
 */
export const testAllServices = async () => {
  console.group('=== PRUEBAS DE API ===');

  // Probar conexión raíz primero
  await testBackendConnection();

  try {
    // Probar servicio de categorías (público)
    console.log('\nProbando servicio de categorías...');
    const categoriesResponse = await categoryService.getAllCategories(); // Usar servicio
    console.log('✅ Categorías obtenidas:', categoriesResponse.data.length);

    // Probar inicio de sesión
    console.log('\nProbando inicio de sesión (usuario demo)...');
    // Asegúrate que 'demo@example.com' y 'password123' existan en tu BD o usa credenciales válidas
    const loginResponse = await authService.login({ // Usar servicio
      email: 'demo@example.com', // CAMBIAR si es necesario
      password: 'password123'    // CAMBIAR si es necesario
    });
    console.log('✅ Login exitoso, token recibido:', !!loginResponse.data.token);
    // El interceptor de apiClient ya debería haber guardado el token

    // Probar obtener publicaciones (requiere token)
    console.log('\nProbando obtener publicaciones...');
    const postsResponse = await postService.getAllPosts(); // Usar servicio
    console.log('✅ Publicaciones obtenidas:', postsResponse.data.length);

    // Si hay publicaciones, probar favoritos (requiere token)
    if (postsResponse.data.length > 0) {
      const firstPostId = postsResponse.data[0].id;
      console.log('\nProbando marcar como favorito, post ID:', firstPostId);
      const favoriteResponse = await favoriteService.toggleFavorite(firstPostId); // Usar servicio
      console.log('✅ Toggle favorito respuesta:', favoriteResponse.data);
    }

    // Probar obtener perfil (requiere token)
    console.log('\nProbando obtener perfil...');
    const profileResponse = await authService.getProfile(); // Usar servicio
    console.log('✅ Perfil obtenido:', profileResponse.data.email);


    console.log('\n✅ Todas las pruebas completadas con éxito (con usuario demo)');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('Detalles del error (respuesta):', error.response.data);
    } else if (error.request) {
      console.error('Detalles del error (solicitud): No hubo respuesta');
    } else {
       console.error('Detalles del error (configuración):', error.message);
    }
  }

  console.groupEnd();

  return 'Pruebas finalizadas. Revisa la consola para ver los resultados.';
};

export default testAllServices; // Exportar la función principal
