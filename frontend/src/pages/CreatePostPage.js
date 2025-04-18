import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { postService } from '../services/apiClient'; // Importar postService
import CategorySelector from '../components/CategorySelector'; // Asegurarse que CategorySelector usa categoryService
import ImageUploader from '../components/ImageUploader'; // Asegurarse que ImageUploader usa uploadService

const CreatePostPage = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUploaded = (url) => {
    setImageUrl(url);
    setFormData((prev) => ({ ...prev, imagen: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError(null);

    const postData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      categoria_id: parseInt(formData.categoria_id, 10),
      imagen: imageUrl || null,
    };

    if (isNaN(postData.precio) || isNaN(postData.categoria_id)) {
      setError('El precio y la categoría son obligatorios.');
      setLoading(false);
      return;
    }
    if (!postData.imagen) {
      setError('La imagen es obligatoria.');
      setLoading(false);
      return;
    }

    try {
      const response = await postService.createPost(postData);

      console.log('Publicación creada:', response.data);
      navigate(`/post/${response.data.id}`);
    } catch (err) {
      console.error('Error al crear la publicación:', err);
      setError(err.response?.data?.error || err.message || 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: '700px' }}>
      <h1>Crear Nueva Publicación</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle" className="mb-3">
          <Form.Label>Título<span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Por favor ingresa un título.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formDescription" className="mb-3">
          <Form.Label>Descripción<span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Por favor ingresa una descripción.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formPrice" className="mb-3">
          <Form.Label>Precio<span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min="0.01"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Por favor ingresa un precio válido.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formImage" className="mb-3">
          <Form.Label>Imagen de la Publicación<span className="text-danger">*</span></Form.Label>
          <ImageUploader onImageUploaded={handleImageUploaded} initialImage={imageUrl} />
          <Form.Control type="hidden" required={!imageUrl} />
          <Form.Control.Feedback type="invalid">
            Por favor sube una imagen.
          </Form.Control.Feedback>
        </Form.Group>

        <CategorySelector
          value={formData.categoria_id}
          onChange={handleChange}
          required={true}
        />

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            'Crear Publicación'
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default CreatePostPage;