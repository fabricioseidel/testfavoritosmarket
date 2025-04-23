import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { postService } from '../services/apiClient'; // Import postService

const ClaimPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { user } = useContext(UserContext);

  const fetchUnclaimedPosts = async () => {
    setLoading(true); // Set loading true at the start
    try {
      // OPTION 1: Ideal - Use a dedicated endpoint (if it exists or can be created)
      // const response = await postService.getUnclaimedPosts();
      // setPosts(response.data || []);

      // OPTION 2: Current (less efficient) - Fetch all and filter client-side
      console.warn("Fetching all posts to find unclaimed ones. Consider a dedicated backend endpoint.");
      const response = await postService.getAllPosts();
      const unclaimedPosts = Array.isArray(response.data)
                             ? response.data.filter(post => !post.usuario_id)
                             : [];
      setPosts(unclaimedPosts);

      setError(null);
    } catch (err) {
      console.error('Error al obtener publicaciones sin reclamar:', err);
      setError(err.response?.data?.error || err.message || 'Error al cargar publicaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchUnclaimedPosts();
    } else {
      setError('Debes iniciar sesión para ver esta página');
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Depend only on user

  const handleClaimPost = async (postId) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Use postService to claim the post
      const claimResponse = await postService.claimPost(postId);

      console.log('Respuesta al reclamar:', claimResponse.data.message);

      setSuccessMessage(`¡Publicación reclamada exitosamente!`);

      // Refresh the list efficiently by removing the claimed post locally
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
      // Or refetch if local update is complex: fetchUnclaimedPosts();

    } catch (err) {
      console.error('Error al reclamar publicación:', err);
      setError(err.response?.data?.error || 'Error al reclamar la publicación');
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

  if (error && !user) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Reclamar Publicaciones</h1>
      
      <Alert variant="info">
        Esta página te permite reclamar publicaciones que no tienen un usuario asignado.
        Una vez reclamadas, aparecerán en tu lista de "Mis Publicaciones".
      </Alert>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      
      {posts.length === 0 ? (
        <Alert variant="info">
          No hay publicaciones sin reclamar en este momento.
        </Alert>
      ) : (
        <>
          <h2 className="mb-3">Publicaciones Disponibles para Reclamar</h2>
          <Row>
            {posts.map(post => (
              <Col key={post.id} md={4} className="mb-4">
                <Card>
                  <Card.Img 
                    variant="top" 
                    src={post.imagen}
                    style={{ height: '180px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x150?text=Sin+Imagen';
                    }}
                  />
                  <Card.Body>
                    <Card.Title>{post.titulo}</Card.Title>
                    <Card.Text>
                      {post.descripcion.substring(0, 100)}
                      {post.descripcion.length > 100 ? '...' : ''}
                    </Card.Text>
                    <Button 
                      variant="primary" 
                      onClick={() => handleClaimPost(post.id)}
                    >
                      Reclamar Esta Publicación
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
      
      <div className="mt-4">
        <Link to="/my-posts">
          <Button variant="outline-secondary">
            Volver a Mis Publicaciones
          </Button>
        </Link>
      </div>
    </Container>
  );
};

export default ClaimPostsPage;
