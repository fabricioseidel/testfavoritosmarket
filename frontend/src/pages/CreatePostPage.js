import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import CategorySelector from '../components/CategorySelector';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
        console.log('Categorías cargadas:', response.data);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };

    fetchCategories();
  }, []);

  // Validar campos de forma individual
  const validateFields = () => {
    console.log('Validando campos:', { title, description, categoryId, price, image });
    
    if (!title.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    
    if (!description.trim()) {
      setError('La descripción es obligatoria');
      return false;
    }
    
    if (!categoryId) {
      setError('Debes seleccionar una categoría');
      return false;
    }
    
    if (!price || Number(price) <= 0) {
      setError('El precio debe ser un número positivo');
      return false;
    }
    
    if (!image) {
      setError('La imagen es obligatoria');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    console.log('Usuario en el contexto:', user);
    console.log('Valores del formulario:', { title, description, categoryId, price, image });

    if (!user || !user.token) {
      setError('Debes iniciar sesión para crear una publicación');
      return;
    }

    // Validar todos los campos
    if (!validateFields()) {
      return;
    }

    setLoading(true);

    // Formatear datos para enviar
    const dataToSend = {
      titulo: title,
      descripcion: description,
      categoria_id: parseInt(categoryId), // Convertir a número
      precio: parseFloat(price),
      imagen: image
    };

    console.log('Datos a enviar al servidor:', dataToSend);

    try {
      const response = await axios.post(
        '/api/posts/create-post',
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);
      setSuccess(true);
      
      // Limpiar formulario
      setTitle('');
      setDescription('');
      setCategoryId('');
      setPrice('');
      setImage('');

      // Redirección después de un breve delay
      setTimeout(() => {
        navigate('/my-posts');
      }, 2000);
    } catch (err) {
      console.error('Error al crear la publicación:', err);
      const errorMsg = err.response?.data?.error || 'Ocurrió un error al crear la publicación';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Crear Publicación</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Publicación creada exitosamente. Redirigiendo...</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del producto"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el producto que estás vendiendo"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ingresa el precio"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>URL de la Imagen</Form.Label>
          <Form.Control
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            required
          />
          {image && (
            <div className="mt-2 text-center">
              <p>Vista previa:</p>
              <img 
                src={image} 
                alt="Vista previa" 
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                }}
              />
            </div>
          )}
        </Form.Group>
        
        <div className="d-grid gap-2 mt-4">
          <Button 
            variant="primary" 
            size="lg" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Publicación'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreatePostPage;