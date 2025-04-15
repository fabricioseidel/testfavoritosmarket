import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [authorName, setAuthorName] = useState(''); // Inicializamos como cadena vacía

  useEffect(() => {
    // Obtener los detalles del post
    axios.get(`/api/posts/${id}`)
      .then(response => {
        console.log('Datos recibidos del backend:', response.data); // Log para depuración
        setPost(response.data);
        setError(null);

        // Obtener el nombre del usuario asociado al usuario_id
        return axios.get(`/api/users/${response.data.usuario_id}`);
      })
      .then(userResponse => {
        console.log('Datos del usuario:', userResponse.data); // Log para depuración
        setAuthorName(userResponse.data.nombre); // Asignar el nombre del usuario
      })
      .catch(error => {
        console.error('Error al obtener el detalle del post o el usuario:', error);
        setError('No se pudo cargar la información del producto.');
      });
  }, [id]);

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/home')}>
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="mt-5">
        <p>Cargando información del producto...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        {/* Imagen del producto */}
        <Col md={6}>
          <img
            src={post.imagen}
            alt={post.titulo}
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        </Col>

        {/* Detalles del producto */}
        <Col md={6}>
          <h1>{post.titulo}</h1>
          <p><strong>Descripción:</strong> {post.descripcion}</p>
          <p><strong>Categoría:</strong> {post.categoria || 'Sin categoría'}</p>
          <p><strong>Precio:</strong> ${post.precio}</p>
          <p><strong>Publicado por:</strong> {authorName || 'Usuario desconocido'}</p>
          <p><strong>Fecha de publicación:</strong> {new Date(post.fecha_creacion).toLocaleDateString()}</p>

          {/* Botón para regresar */}
          <Button variant="primary" onClick={() => navigate('/home')} className="mt-3">
            Volver al Inicio
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetailPage;