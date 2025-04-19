import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { postService, favoriteService } from '../services/apiClient';
import { UserContext } from '../context/UserContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Iconos para favoritos

const PostDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`PostDetailPage: Fetching post with id: ${id}`);
        const response = await postService.getPostById(id);
        console.log('PostDetailPage: API response received:', response);
        setPost(response.data);

        // Si el usuario está logueado, verificar si es favorito
        if (user && response.data) {
          checkIfFavorite(response.data.id);
        }

      } catch (err) {
        console.error('PostDetailPage: Error fetching post:', err.response?.data || err.message);
        setError(err.response?.status === 404 ? 'Publicación no encontrada.' : 'Ocurrió un error al cargar la publicación.');
      } finally {
        setLoading(false);
      }
    };

    const checkIfFavorite = async (postId) => {
        setFavoriteLoading(true);
        try {
            console.log(`PostDetailPage: Checking favorite status for post id: ${postId}`);
            const favResponse = await favoriteService.checkFavorite(postId);
            console.log('PostDetailPage: Favorite check response:', favResponse);
            setIsFavorite(favResponse.data.isFavorite);
        } catch (favErr) {
            // No mostrar error de favorito al usuario, solo loguear
            console.error('PostDetailPage: Error checking favorite status:', favErr.response?.data || favErr.message);
            // Podríamos asumir false si hay error, o dejarlo como estaba
            // setIsFavorite(false);
        } finally {
            setFavoriteLoading(false);
        }
    };

    fetchPost();
  }, [id, user]); // Depender de 'id' y 'user'

  const handleToggleFavorite = async () => {
    if (!user) {
      // Opcional: redirigir a login o mostrar mensaje
      alert('Debes iniciar sesión para añadir a favoritos.');
      return;
    }
    if (!post || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      console.log(`PostDetailPage: Toggling favorite for post id: ${post.id}`);
      const response = await favoriteService.toggleFavorite(post.id);
      console.log('PostDetailPage: Toggle favorite response:', response);
      setIsFavorite(response.data.isFavorite); // Actualizar estado basado en la respuesta
    } catch (err) {
      console.error('PostDetailPage: Error toggling favorite:', err.response?.data || err.message);
      setError('Error al actualizar favoritos.'); // Mostrar error al usuario
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando publicación...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!post) {
    // Esto no debería ocurrir si loading es false y no hay error, pero por si acaso
    return <Container className="mt-5"><Alert variant="warning">No se encontró la publicación.</Alert></Container>;
  }

  // Formatear precio
  const formattedPrice = post.precio ? `$${post.precio.toLocaleString('es-CL')}` : 'Precio no disponible';

  return (
    <Container className="my-5">
      <Row>
        <Col md={6}>
          <Card>
            <Card.Img variant="top" src={post.imagen || '/placeholder-image.png'} alt={post.titulo} style={{ maxHeight: '500px', objectFit: 'contain' }} />
          </Card>
        </Col>
        <Col md={6}>
          <h1>{post.titulo}</h1>
          {post.categoria_nombre && (
            <Badge bg="secondary" className="mb-2">{post.categoria_nombre}</Badge>
          )}
          <p className="lead">{post.descripcion}</p>
          <h3 className="text-primary">{formattedPrice}</h3>
          {post.usuario_nombre && (
            <p className="text-muted">Publicado por: {post.usuario_nombre}</p>
          )}
          <p className="text-muted">
            Publicado el: {new Date(post.fecha_creacion).toLocaleDateString('es-CL')}
          </p>
          {user && ( // Mostrar botón de favorito solo si el usuario está logueado
            <Button
              variant={isFavorite ? "danger" : "outline-danger"}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className="mb-3 d-flex align-items-center"
            >
              {favoriteLoading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              ) : (
                isFavorite ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />
              )}
              {isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
            </Button>
          )}
           {/* Botón para añadir al carrito (si aplica) */}
           {/* <Button variant="success">Añadir al Carrito</Button> */}

           {/* Botón para volver */}
           <Button variant="outline-secondary" as={Link} to="/" className="ms-2">
             Volver al Inicio
           </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetailPage;