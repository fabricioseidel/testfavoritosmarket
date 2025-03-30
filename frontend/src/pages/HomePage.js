import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para cargar publicaciones
  const fetchPosts = () => {
    axios.get('/api/posts')
      .then(response => {
        setPosts(response.data);
        setError(null);
      })
      .catch(err => {
        console.error('❌ Error al cargar publicaciones:', err.message);
        setError('No se pudieron cargar las publicaciones.');
      });
  };

  // Cargar publicaciones al montar el componente
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container className="mt-4">
      <h1>Página Principal</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <Row>
          {Array.isArray(posts) && posts.map(post => (
            <Col key={post.id} xs={12} sm={6} md={4} lg={3}>
              <PostCard
                id={post.id} // ✅ Agregado
                title={post.titulo}
                description={post.descripcion}
                price={Number(post.precio)} // ✅ Convertido a número
                image={post.imagen}
                onClick={() => navigate(`/post/${post.id}`)} // Detalle del post
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default HomePage;