import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const FavoritePosts = () => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchFavorites = async () => {
    const token = user?.token;

    if (!token) {
      setError('Debes iniciar sesión para ver tus favoritos');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites(response.data);
      setError('');
    } catch (err) {
      console.error('❌ Error al obtener favoritos:', err.response?.data || err.message);
      setError('No se pudieron cargar los favoritos. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleToggleFavorite = (postId, isNowFavorite) => {
    if (!isNowFavorite) {
      // Si ya no es favorito, lo removemos del estado
      setFavorites((prev) => prev.filter((post) => post.id !== postId));
    }
  };

  return (
    <Container className="mt-5">
      <h1>Mis Favoritos</h1>

      {loading && <p>⏳ Cargando favoritos...</p>}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && favorites.length === 0 && !error && (
        <p>No tienes publicaciones en favoritos todavía.</p>
      )}

      <Row>
        {favorites.map((post) => (
          <Col key={post.id} xs={12} sm={6} md={4} lg={3}>
            <PostCard
              id={post.id}
              title={post.titulo}
              description={post.descripcion}
              price={Number(post.precio)}
              image={post.imagen}
              initialFavorite={true}
              onClick={() => console.log(`🖱️ Click en favorito ID ${post.id}`)}
              onToggleFavorite={handleToggleFavorite}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FavoritePosts;