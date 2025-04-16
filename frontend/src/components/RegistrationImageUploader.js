import React, { useState, useRef } from 'react';
import { Button, Form, Image, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

const RegistrationImageUploader = ({ onImageUploaded, initialImage }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(initialImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validación de tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    // Validación de tipo
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Formato no soportado. Use JPG, PNG, GIF o WEBP');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Crear URL para previsualización
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Usamos un endpoint específico para registro que no requiere autenticación
      const response = await axios.post('/api/upload/registration-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      // Llamar al callback con la URL de la imagen
      onImageUploaded(response.data.fileUrl);
      
      // Mantener la previsualización
      setPreview(response.data.fileUrl);
      
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para arrastrar y soltar archivos
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files }});
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Foto de Perfil</Form.Label>
      
      {preview && (
        <div className="mb-3 text-center">
          <Image 
            src={preview} 
            alt="Previsualización" 
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
            thumbnail
            onError={(e) => {
              // Prevenir bucle infinito
              if (e.target.hasAttribute('data-fallback-applied')) return;
              e.target.setAttribute('data-fallback-applied', 'true');
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPlNpbiBJbWFnZW48L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
      )}
      
      <div 
        className="drop-area p-4 mb-2 border rounded text-center"
        style={{ 
          border: '2px dashed #ccc', 
          backgroundColor: '#f8f9fa',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="mb-1">
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem' }}></i>
        </p>
        <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
        <Form.Control 
          type="file" 
          onChange={handleFileChange}
          accept="image/*"
          disabled={loading}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </div>
      
      {progress > 0 && loading && (
        <ProgressBar now={progress} label={`${progress}%`} className="mt-2" />
      )}
      
      <div className="mt-2">
        <Button 
          variant="primary" 
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="mt-2 w-100"
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Subiendo...
            </>
          ) : 'Subir Imagen'}
        </Button>
      </div>
      
      {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
      
      <Form.Text className="text-muted mt-2 d-block">
        Formatos permitidos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB.
      </Form.Text>
    </Form.Group>
  );
};

export default RegistrationImageUploader;
