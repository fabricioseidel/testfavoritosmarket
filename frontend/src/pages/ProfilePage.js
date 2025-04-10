import React, { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../context/UserContext';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    foto_perfil: '',
    fecha_registro: ''
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalFavoritos: 0
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfileData(response.data);
    } catch (err) {
      console.error('Error en fetchProfileData:', err);
      setError('Error al cargar datos del perfil');
    }
  }, [user?.token]);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/profile/stats', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error en fetchUserStats:', err);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) {
      fetchProfileData();
      fetchUserStats();
    }
  }, [user?.token, fetchProfileData, fetchUserStats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/profile/update', profileData, { // Actualizar la ruta
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess(true);
      setEditing(false);
    } catch (err) {
      setError('Error al actualizar perfil');
    }
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Debes iniciar sesión para ver tu perfil
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Img 
              variant="top" 
              src={profileData.foto_perfil || 'https://placehold.co/150'} // Cambiar placeholder
              className="rounded-circle mx-auto mt-3"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/150';
              }}
            />
            <Card.Body>
              <Card.Title>{profileData.nombre}</Card.Title>
              <Card.Text>{profileData.email}</Card.Text>
              <Button 
                variant="outline-primary" 
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancelar' : 'Editar Perfil'}
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Estadísticas</Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <h4>{stats.totalPosts}</h4>
                  <p>Publicaciones</p>
                </Col>
                <Col>
                  <h4>{stats.totalFavoritos}</h4>
                  <p>Favoritos</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Perfil actualizado exitosamente</Alert>}

          {editing ? (
            <Card>
              <Card.Header>Editar Perfil</Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData.nombre}
                      onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>URL de Foto de Perfil</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData.foto_perfil}
                      onChange={(e) => setProfileData({...profileData, foto_perfil: e.target.value})}
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary">
                    Guardar Cambios
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Header>Información del Perfil</Card.Header>
              <Card.Body>
                <p><strong>Email:</strong> {profileData.email}</p>
                {/* Removemos la fecha de registro por ahora */}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;