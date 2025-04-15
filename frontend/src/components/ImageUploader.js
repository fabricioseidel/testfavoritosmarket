import React, { useState, useContext } from 'react';
import { Button, Form, Image, Spinner, Alert } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

const ImageUploader = ({ onImageUploaded, initialImage }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(initialImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear URL para previsualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    if (!user || !user.token) {
      setError('Debes iniciar sesión para subir imágenes');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
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

  return (
    <Form.Group className="mb-3">
      <Form.Label>Imagen</Form.Label>
      
      {preview && (
        <div className="mb-3">
          <Image 
            src={preview} 
            alt="Previsualización" 
            style={{ maxWidth: '200px', maxHeight: '200px' }} 
            thumbnail
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://via.placeholder.com/200?text=Imagen+no+válida';
            }}
          />
        </div>
      )}
      
      <Form.Control 
        type="file" 
        onChange={handleFileChange}
        accept="image/*"
        disabled={loading}
      />
      
      <div className="mt-2">
        <Button 
          variant="primary" 
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="mt-2"
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Subiendo...
            </>
          ) : 'Subir Imagen'}
        </Button>
      </div>
      
      {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
      
      <Form.Text className="text-muted">
        Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB.
      </Form.Text>
    </Form.Group>
  );
};

export default ImageUploader;
