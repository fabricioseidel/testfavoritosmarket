import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Datos enviados al backend:', {
      titulo: title,
      descripcion: description,
      categoria: category,
      precio: Number(price),
      imagen: image
    });

    if (!user || !user.token) {
      alert('Debes iniciar sesión para crear una publicación');
      return;
    }

    try {
      const response = await axios.post(
        '/api/posts',
        {
          titulo: title,
          descripcion: description,
          categoria: category,
          precio: Number(price),
          imagen: image
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Publicación creada:', response.data);
      setSuccess(true);
      setError(null);

      // Limpiar el formulario
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
      setImage('');

      // Redirigir al usuario después de 2 segundos
      setTimeout(() => {
        navigate('/my-posts');
      }, 2000);
    } catch (err) {
      console.error('Error detallado:', err.response || err);
      setError(err.response?.data?.error || 'Error al crear la publicación.');
      setSuccess(false);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Crear Publicación</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Publicación creada exitosamente. Redirigiendo...</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle" className="mb-3">
          <Form.Label>Título</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingresa el título de la publicación"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDescription" className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ingresa la descripción de la publicación"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formCategory" className="mb-3">
          <Form.Label>Categoría</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingresa la categoría de la publicación"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formPrice" className="mb-3">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="number"
            placeholder="Ingresa el precio de la publicación"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formImage" className="mb-3">
          <Form.Label>Imagen (URL)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingresa la URL de la imagen"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Crear Publicación
        </Button>
      </Form>
    </Container>
  );
};

export default CreatePostPage;