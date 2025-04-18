import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Image, Button } from 'react-bootstrap';

// Imagen base64 para usar como fallback
const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPlNpbiBJbWFnZW48L3RleHQ+PC9zdmc+';

const BaseImageUploader = ({ onFileUpload, initialImage = '', label = "Subir Imagen", required = false }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(initialImage || defaultImage);

  const handleFileChange = (event) => {
    console.log('BaseImageUploader: handleFileChange disparado!'); // Log 1
    const file = event.target.files[0];
    if (file) {
      console.log('BaseImageUploader: Archivo seleccionado:', file.name); // Log 2
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (onFileUpload) {
        console.log('BaseImageUploader: Llamando a onFileUpload...'); // Log 3
        onFileUpload(file);
      } else {
        console.warn('BaseImageUploader: Prop onFileUpload no encontrada.');
      }
    } else {
       console.log('BaseImageUploader: No se seleccionó archivo.');
    }
     // Resetear el valor del input para permitir seleccionar el mismo archivo de nuevo
     if (event.target) {
        event.target.value = null;
     }
  };

  const handleButtonClick = () => {
    console.log('BaseImageUploader: handleButtonClick disparado!'); // Log 4
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Simular clic en el input oculto
      console.log('BaseImageUploader: Clic simulado en input de archivo.'); // Log 5
    } else {
       console.error('BaseImageUploader: Referencia al input de archivo no encontrada.');
    }
  };

  const handleImageError = (e) => {
    if (!e.target.src.startsWith('data:image')) {
       setPreview(defaultImage);
    }
  };

  // Actualizar previsualización si initialImage cambia
  useEffect(() => {
    setPreview(initialImage || defaultImage);
  }, [initialImage]);

  return (
    <div className="mb-3 text-center">
      <Form.Label>{label}{required && <span className="text-danger">*</span>}</Form.Label>
      <div>
        <Image
          src={preview}
          alt="Previsualización"
          thumbnail
          style={{ width: '150px', height: '150px', objectFit: 'cover', marginBottom: '10px', cursor: 'pointer' }}
          onClick={handleButtonClick} // Clic en imagen activa el input
          onError={handleImageError}
        />
      </div>
      {/* Input de archivo oculto */}
      <Form.Control
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange} // Este es el evento clave
        accept="image/*"
        style={{ display: 'none' }}
        required={required && !preview}
      />
      {/* Botón visible */}
      <Button variant="outline-primary" size="sm" onClick={handleButtonClick}>
        Seleccionar Archivo
      </Button>
       <Form.Control.Feedback type="invalid">
         Por favor selecciona una imagen.
       </Form.Control.Feedback>
    </div>
  );
};

BaseImageUploader.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
  initialImage: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool
};

export default BaseImageUploader;
