import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        if (!user?.token) {
          setError('Debes iniciar sesión para ver tus publicaciones');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/posts/user-posts', {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        setPosts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar publicaciones:', err);
        setError('Error al cargar tus publicaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) return <Container className="my-5"><p>Cargando publicaciones...</p></Container>;
  if (error) return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mis Publicaciones</h1>
        <Link to="/create-post">
          <Button variant="primary">
            Nueva Publicación
          </Button>
        </Link>
      </div>

      <Table responsive striped hover className="shadow-sm">
        <thead className="bg-light">
          <tr>
            <th>Título</th>
            <th>Precio</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>{post.titulo}</td>
              <td>${post.precio}</td>
              <td>{new Date(post.fecha).toLocaleDateString()}</td>
              <td>
                <Badge bg={post.estado === 'activo' ? 'success' : 'secondary'}>
                  {post.estado}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    Eliminar
                  </Button>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => handleViewPost(post.id)}
                  >
                    Ver
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {posts.length === 0 && (
        <div className="text-center p-5 bg-light rounded">
          <h3>No tienes publicaciones aún</h3>
          <p className="text-muted">¡Comienza creando tu primera publicación!</p>
          <Link to="/create-post">
            <Button variant="primary">
              Crear Publicación
            </Button>
          </Link>
        </div>
      )}
    </Container>
  );
};

export default MyPostsPage;
