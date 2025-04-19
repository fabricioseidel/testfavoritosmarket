import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import PostCard from '../components/PostCard';
import { favoriteService } from '../services/apiClient';

const FavoritePosts = () => {
  const { user } = useContext(UserContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!user?.token) {
      setError('Debes iniciar sesión para ver tus favoritos.');
      setLoading(false);
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('FavoritePosts: Fetching favorites...');
      const response = await favoriteService.getFavorites();
      console.log('FavoritePosts: API response received:', response);

      if (response && Array.isArray(response.data)) {
        setFavorites(response.data);
        console.log('FavoritePosts: Favorites state updated with', response.data.length, 'items.');
      } else {
        console.warn('FavoritePosts: API did not return an array in response.data. Setting favorites to []. Response:', response);
        setError('Respuesta inesperada del servidor al cargar favoritos.');
        setFavorites([]);
      }
    } catch (err) {
      console.error('FavoritePosts: Error fetching favorites:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Ocurrió un error al cargar tus favoritos.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
      setFavorites([]);
      setError('Debes iniciar sesión para ver tus favoritos.');
    }
  }, [user, fetchFavorites]);

  const handleFavoriteToggle = (postId, isFavorite) => {
    console.log(`Favorito cambiado: postId=${postId}, isFavorite=${isFavorite}`);
    
    if (!isFavorite) {
      setFavorites(prevFavorites => 
        prevFavorites.filter(fav => fav.publicacion_id !== postId)
      );
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando favoritos...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !user) {
    return <Container className="mt-5"><Alert variant="warning">{error}</Alert></Container>;
  }

  if (error && user) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="my-5">
      <h1>Mis Favoritos</h1>
      {favorites.length === 0 ? (
        <Alert variant="info">Aún no tienes publicaciones favoritas.</Alert>
      ) : (
        <Row>
          {favorites.map(fav => (
            <Col key={fav.id || fav.publicacion_id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <PostCard
                id={fav.id}
                title={fav.titulo}
                description={fav.descripcion}
                price={parseFloat(fav.precio)}
                image={fav.imagen}
                onFavorite={handleFavoriteToggle}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default FavoritePosts;