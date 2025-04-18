import { useState } from 'react';
import { uploadService } from '../services/apiClient'; // Importar uploadService

/**
 * Hook para manejar la subida de imágenes.
 * @param {Function} onUploadSuccess - Callback a ejecutar cuando la subida es exitosa. Recibe la URL de la imagen.
 * @param {boolean} isRegistration - Indica si la subida es para registro (sin autenticación necesaria en la llamada).
 * @returns {Function} Función para manejar la subida del archivo.
 */
export const useImageUpload = (onUploadSuccess, isRegistration = false) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', file); // Asegúrate que el backend espera 'image'

    try {
      let response;
      const onProgress = (percent) => setProgress(percent);

      if (isRegistration) {
        // Usar la función específica para registro
        response = await uploadService.uploadRegistrationImage(formData, onProgress);
      } else {
        // Usar la función estándar para subida de imágenes (requiere auth)
        response = await uploadService.uploadImage(formData, onProgress);
      }

      if (response.data && response.data.imageUrl) {
        onUploadSuccess(response.data.imageUrl); // Llamar al callback con la URL
      } else {
        throw new Error('Respuesta inválida del servidor de subida');
      }
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError(err.response?.data?.error || err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      setProgress(100); // Marcar como completado (o resetear a 0)
    }
  };

  // Podrías devolver más estado si es necesario (uploading, error, progress)
  return handleUpload;
};
