import React from 'react';
import PropTypes from 'prop-types';
import { useImageUpload } from '../hooks/useImageUpload';
import BaseImageUploader from './BaseImageUploader';

/**
 * Componente para subir imágenes (requiere autenticación por defecto).
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onImageUploaded - Función a llamar cuando se sube una imagen
 * @param {string} props.initialImage - URL de imagen inicial para mostrar
 * @param {string} props.label - Etiqueta para el input
 */
const ImageUploader = ({ onImageUploaded, initialImage = '', label = "Subir Imagen" }) => {
  // Usar el hook useImageUpload (isRegistration = false por defecto)
  const uploadImage = useImageUpload(onImageUploaded, false);

  return (
    <BaseImageUploader
      onFileUpload={uploadImage} // Pasar la función del hook
      initialImage={initialImage}
      label={label}
      required={false} // O según sea necesario
      // Pasar estado de carga/error/progreso si BaseImageUploader lo soporta
    />
  );
};

ImageUploader.propTypes = {
  onImageUploaded: PropTypes.func.isRequired,
  initialImage: PropTypes.string,
  label: PropTypes.string
};

export default ImageUploader;
