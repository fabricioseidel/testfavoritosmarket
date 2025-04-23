import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import { UserContext } from '../context/UserContext';
import { postService, favoriteService } from '../services/apiClient';

const PostsGalleryPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

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
          setError('Error: Formato de datos inesperado.');
          setPosts([]);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch posts aborted');
        } else {
          console.error('Error fetching posts:', err);
          setError(err.response?.data?.error || err.message || 'Error al cargar publicaciones.');
          setPosts([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, []);

  const handleViewDetail = (postId) => {
    console.log('Viewing detail for post:', postId);
  };

  const handleFavorite = async (postId, currentIsFavorite) => {
    if (!user?.token) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }
    try {
      const response = await favoriteService.toggleFavorite(postId);
      console.log('Favorite toggled via service:', response.data);
    } catch (error) {
      console.error('Error toggling favorite via service:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Error al gestionar favorito');
    }
  };

  if (loading) {
    return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="mt-5">
      <h1>Galería de Publicaciones</h1>
      {posts.length === 0 ? (
        <Alert variant="info">No hay publicaciones disponibles.</Alert>
      ) : (
        <Row>
          {posts.map(post => (
            <Col key={`post-${post.id}`} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <PostCard
                id={Number(post.id)}
                title={post.titulo}
                description={post.descripcion}
                price={parseFloat(post.precio)}
                image={post.imagen}
                onFavorite={handleFavorite}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PostsGalleryPage;