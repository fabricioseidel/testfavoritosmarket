import React, { useState, useEffect, useContext } from 'react';
// Removed axios import
import { UserContext } from '../context/UserContext';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import CategorySelector from '../components/CategorySelector';
import ImageUploader from '../components/ImageUploader'; // Importamos el componente
import { postService } from '../services/apiClient'; // Import postService

const EditPostPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Cargar los datos de la publicación
  useEffect(() => {
    const fetchPostData = async () => {
      if (!user?.token) {
        setError('Debes iniciar sesión para editar una publicación');
        setLoading(false);
        return;
      }

      try {
        // Use postService to get post data
        const response = await postService.getPostById(id);
        const post = response.data;

        if (!post) {
          setError('No se encontró la publicación');
          setLoading(false);
          return;
        }

        let userId = user.id;

        console.log('Datos del post recibidos:', post);
        console.log('Usuario actual ID:', userId);
        console.log('ID del usuario del post:', post.usuario_id);

        const postUserId = parseInt(post.usuario_id, 10);
        const currentUserId = parseInt(userId, 10);

        if (isNaN(currentUserId) || postUserId !== currentUserId) {
          if (userId === undefined) {
            console.warn('ID de usuario no disponible en el frontend, permitiendo edición pero podría ser inseguro.');
          } else {
            setError('No tienes permiso para editar esta publicación');
            setLoading(false);
            return;
          }
        }

        setTitle(post.titulo || '');
        setDescription(post.descripcion || '');
        setCategoryId(post.categoria_id || '');
        setPrice(post.precio ? post.precio.toString() : '');
        setImage(post.imagen || '');

        setError('');
      } catch (err) {
        console.error('Error al cargar la publicación:', err);
        setError(err.response?.data?.error || err.message || 'No se pudo cargar la información de la publicación');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      alert('Debes iniciar sesión para editar una publicación');
      return;
    }

    if (!title || !description || !categoryId || !price || !image) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const dataToSend = {
      titulo: title,
      descripcion: description,
      categoria_id: parseInt(categoryId, 10),
      precio: parseFloat(price),
      imagen: image,
    };

    if (isNaN(dataToSend.categoria_id)) {
      setError('Por favor selecciona una categoría válida.');
      return;
    }
    if (isNaN(dataToSend.precio) || dataToSend.precio <= 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }

    try {
      console.log(`Actualizando post con ID: ${id}`);
      const response = await postService.updatePost(id, dataToSend);

      console.log("Respuesta del servidor:", response.data);

      setSuccess(true);
      setError(null);

      setTimeout(() => {
        navigate('/my-posts');
      }, 2000);
    } catch (err) {
      console.error('Error editando la publicación:', err);
      setError(err.response?.data?.error || err.message || 'Ocurrió un error al editar la publicación');
      setSuccess(false);
    }
  };

  const handleImageUploaded = (imageUrl) => {
    setImage(imageUrl);
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Editar Publicación</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Publicación actualizada exitosamente. Redirigiendo...</Alert>}

      {loading ? (
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </Container>
      ) : !error ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTitle" className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el título de la publicación"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formDescription" className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingresa la descripción de la publicación"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <CategorySelector
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          />

          <Form.Group controlId="formPrice" className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Ingresa el precio de la publicación"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>

          <ImageUploader 
            onImageUploaded={handleImageUploaded}
            initialImage={image}
          />

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => navigate('/my-posts')} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Actualizar Publicación
            </Button>
          </div>
        </Form>
      ) : (
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => navigate('/my-posts')}>
            Volver a Mis Publicaciones
          </Button>
        </div>
      )}
    </Container>
  );
};

export default EditPostPage;
