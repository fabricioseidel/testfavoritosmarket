import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Image, Alert } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import { authService } from '../services/apiClient'; // Importar authService
import ImageUploader from '../components/ImageUploader';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Campos editables
  const [nombre, setNombre] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Obtener el contexto del usuario
  const { user, login } = useContext(UserContext);

  // Imagen base64 para usar como fallback
  const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPlNpbiBJbWFnZW48L3RleHQ+PC9zdmc+';

  // Función para cargar datos del perfil
  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar si tenemos usuario en contexto (el interceptor añade el token)
      if (!user) {
        setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      console.log('Cargando perfil para usuario ID:', user.id);

      // Usar authService.getProfile
      const response = await authService.getProfile();

      // Verificar respuesta y formatear datos
      if (response.data) {
        console.log('Datos de perfil recibidos:', response.data);
        setProfileData(response.data);
        setNombre(response.data.nombre || '');
        setFotoPerfil(response.data.foto_perfil || '');
      } else {
        throw new Error('Respuesta vacía del servidor');
      }
    } catch (err) {
      console.error('Error al cargar datos del perfil:', err);
      setError(err.response?.data?.error || err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar o si cambia el ID del usuario
  useEffect(() => {
    if (user?.id) { // Verificar que user y user.id existan
      console.log(`ProfilePage useEffect: Cargando datos para user ID: ${user.id}`);
      loadProfileData();
    } else {
      console.log('ProfilePage useEffect: No hay user.id, estableciendo error.');
      setLoading(false);
      setError('Debes iniciar sesión para ver tu perfil.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Depender solo de user.id

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      // El interceptor ya añade el token si el usuario está logueado
      if (!user) {
        setError('Debes iniciar sesión para actualizar tu perfil');
        return;
      }

      const updateData = {
        nombre,
        foto_perfil: fotoPerfil
      };

      // Usar authService.updateProfile
      const updateResponse = await authService.updateProfile(updateData);

      console.log('Perfil actualizado:', updateResponse.data);

      // Actualizar datos locales y contexto
      const updatedUserData = {
        ...user, // Mantener id, email, token
        nombre: updateResponse.data.nombre,
        foto_perfil: updateResponse.data.foto_perfil
      };
      setProfileData(updatedUserData); // Actualizar estado local si aún se usa
      login(updatedUserData); // Actualizar contexto (esto también actualiza localStorage)

      setSuccess(true);
      setIsEditing(false);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError(err.response?.data?.error || err.message || 'No se pudo actualizar el perfil.');
    }
  };

  // Función para manejar URLs de imagen inválidas
  const handleImageError = (e) => {
    console.log(`ProfilePage: handleImageError triggered for src: ${e.target.src}`); // Log de error
    // Solo aplicar fallback si la URL fallida NO es ya la imagen default
    if (fotoPerfil !== defaultProfileImage) {
       console.log('ProfilePage: Aplicando imagen de fallback.');
       setFotoPerfil(defaultProfileImage); // Actualizar estado en lugar de e.target.src
    } else {
       console.log('ProfilePage: La imagen de fallback ya está aplicada o la URL fallida es la de fallback.');
    }
  };

  // Manejar la subida de la imagen de perfil
  const handleImageUploaded = (imageUrl) => {
    console.log(`ProfilePage: handleImageUploaded recibiendo URL: ${imageUrl}`);
    setFotoPerfil(imageUrl);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <p>Cargando datos del perfil...</p>
      </Container>
    );
  }

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
    <Container className="mt-5">
      <h1>Mi Perfil</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">¡Perfil actualizado con éxito!</Alert>}

      <Row>
        <Col md={4} className="text-center mb-4">
          <Image 
            key={fotoPerfil}
            src={fotoPerfil || defaultProfileImage} 
            roundedCircle 
            width={150} 
            height={150} 
            className="mb-3"
            onError={handleImageError}
          />
          {isEditing && (
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              initialImage={fotoPerfil}
            />
          )}
        </Col>

        <Col md={8}>
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={profileData?.email || ''} 
                disabled 
              />
              <Form.Text className="text-muted">
                No es posible cambiar el email asociado a tu cuenta.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
                disabled={!isEditing} 
              />
            </Form.Group>

            {!isEditing ? (
              <Button 
                variant="primary" 
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setNombre(profileData?.nombre || '');
                    setFotoPerfil(profileData?.foto_perfil || '');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="success" 
                  type="submit"
                >
                  Guardar Cambios
                </Button>
              </div>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;