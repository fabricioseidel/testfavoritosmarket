import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card, Image, Spinner } from 'react-bootstrap';
import ImageUploader from '../components/ImageUploader';

const ProfilePage = () => {
  const { user, updateUser } = useContext(UserContext); // Asegúrate de que updateUser está disponible
  const [profileData, setProfileData] = useState({ nombre: '', email: '', foto_perfil: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    nombre: '',
    email: '',
    foto_perfil: ''
  });

  // Función para cargar los datos del perfil
  const loadProfileData = async () => {
    if (!user?.token) {
      setError('Debes iniciar sesión para ver tu perfil');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/profile', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      console.log('Datos de perfil recibidos:', response.data);
      
      // Verificar si los datos tienen el formato esperado
      if (!response.data || !response.data.nombre) {
        throw new Error('Formato de respuesta no válido');
      }
      
      setProfileData(response.data);
      setEditData({
        nombre: response.data.nombre || '',
        email: response.data.email || '',
        foto_perfil: response.data.foto_perfil || ''
      });
      setError('');
    } catch (err) {
      console.error('Error al cargar datos del perfil:', err);
      setError('No se pudieron cargar los datos del perfil. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reiniciar datos de edición al estado actual
    setEditData({
      nombre: profileData.nombre || '',
      email: profileData.email || '',
      foto_perfil: profileData.foto_perfil || ''
    });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleProfileImageUploaded = (imageUrl) => {
    setEditData({
      ...editData,
      foto_perfil: imageUrl
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!editData.nombre.trim() || !editData.email.trim()) {
      setError('El nombre y el email son obligatorios');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      setError('El formato del email no es válido');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Enviando datos para actualización:', editData);
      const response = await axios.put('/api/profile', editData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del servidor:', response.data);
      
      // Actualizar datos locales
      setProfileData(response.data);
      
      // IMPORTANTE: Actualizar el contexto de usuario con los nuevos datos
      if (updateUser) {
        updateUser({
          ...user,
          user: {
            ...user.user,
            nombre: response.data.nombre,
            email: response.data.email,
            foto_perfil: response.data.foto_perfil
          }
        });
      }
      
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
      
      // Recargar la página después de 1 segundo para asegurar que los cambios se reflejen
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un error al actualizar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar URLs de imagen inválidas
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150?text=Imagen+no+disponible';
  };

  if (loading && !profileData.nombre) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Debes iniciar sesión para ver tu perfil.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h3>Mi Perfil</h3>
              <Button 
                variant={isEditing ? "secondary" : "light"} 
                onClick={handleEditToggle}
              >
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </Button>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-4">
                    <Col md={4} className="text-center">
                      <Image 
                        src={editData.foto_perfil || 'https://via.placeholder.com/150'} 
                        roundedCircle 
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        onError={handleImageError}
                      />
                      
                      <div className="mt-3">
                        <ImageUploader 
                          onImageUploaded={handleProfileImageUploaded}
                          initialImage={editData.foto_perfil}
                        />
                      </div>
                    </Col>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                          type="text"
                          name="nombre"
                          value={editData.nombre}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end">
                    <Button variant="secondary" onClick={handleEditToggle} className="me-2">
                      Cancelar
                    </Button>
                    <Button variant="success" type="submit" disabled={loading}>
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <Row>
                  <Col md={4} className="text-center">
                    <Image 
                      src={profileData.foto_perfil || 'https://via.placeholder.com/150?text=Sin+Imagen'} 
                      roundedCircle 
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                      onError={handleImageError}
                    />
                  </Col>
                  <Col md={8}>
                    <h4>{profileData.nombre}</h4>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>ID de usuario:</strong> {user?.id || 'No disponible'}</p>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;