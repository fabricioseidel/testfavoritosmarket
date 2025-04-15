import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Función auxiliar para obtener la fecha formateada
  const getFechaFormateada = (post) => {
    // Intentar con diferentes posibles nombres de campo
    const fechaValue = post.fecha_creacion || post.fecha || post.created_at || post.createdAt || post.date;
    
    if (!fechaValue) {
      // Si no hay campo de fecha, usar la fecha actual sin el texto "(aprox.)"
      console.log('No se encontró campo de fecha para el post:', post.id);
      return new Date().toLocaleDateString();
    }
    
    try {
      const fecha = new Date(fechaValue);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        console.warn('Fecha inválida:', fechaValue);
        return 'Fecha inválida';
      }
      
      return fecha.toLocaleDateString();
    } catch (e) {
      console.error('Error al parsear fecha:', e);
      return 'Error de fecha';
    }
  };

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
      
      console.log('Datos recibidos de publicaciones:', response.data);
      setPosts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
      setError('Error al cargar tus publicaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };
  
  const confirmDelete = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };
  
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await axios.delete(`/api/posts/${postToDelete}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Actualizar la lista de publicaciones
      setPosts(posts.filter(post => post.id !== postToDelete));
      
      // Cerrar el modal
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      alert('No se pudo eliminar la publicación');
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/edit-post/${postId}`);
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
              <td>{getFechaFormateada(post)}</td>
              <td>
                <Badge bg="success">
                  activo {/* Mostrar "activo" por defecto ya que la columna estado no existe */}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleEditPost(post.id)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => confirmDelete(post.id)}
                  >
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
      
      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyPostsPage;
