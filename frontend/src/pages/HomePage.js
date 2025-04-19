import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import { UserContext } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { postService } from '../services/apiClient'; // Importar postService

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const { cart } = useCart();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await postService.getAllPosts({ signal });

        if (Array.isArray(response.data)) {
          setPosts(response.data);
        } else {
          console.error('API did not return an array for posts:', response.data);
          setError('Error: Formato de datos inesperado recibido del servidor.');
          setPosts([]);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Solicitud cancelada');
        } else {
          console.error('Error fetching posts:', err);
          setError(err.response?.data?.error || err.message || 'Error al cargar las publicaciones');
          setPosts([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      controller.abort();
    };
  }, []);

  const handleClaimPost = async (postId) => {
    if (!user) {
      console.error('Usuario no autenticado');
      alert('Debes iniciar sesión para reclamar.');
      return;
    }

    try {
      await postService.claimPost(postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, usuario_id: user.id }
            : post
        )
      );
      alert('Publicación reclamada con éxito');
    } catch (error) {
      console.error('Error al reclamar publicación:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Error al reclamar la publicación.');
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Publicaciones Recientes</h1>
      {posts.length === 0 ? (
        <Alert variant="info">No hay publicaciones disponibles.</Alert>
      ) : (
        <Row>
          {Array.isArray(posts) && posts.map(post => (
            <Col key={post.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <PostCard
                id={post.id}
                title={post.titulo}
                description={post.descripcion}
                price={parseFloat(post.precio)}
                image={post.imagen}
                onClaim={(user && !post.usuario_id) ? () => handleClaimPost(post.id) : undefined}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default HomePage;