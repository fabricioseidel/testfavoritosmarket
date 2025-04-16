import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RegistrationImageUploader from '../components/RegistrationImageUploader';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Manejador para la imagen cargada
  const handleImageUploaded = (imageUrl) => {
    setFotoPerfil(imageUrl);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!email || !password || !nombre) {
      setError('Por favor, completa los campos obligatorios.');
      setSuccess(false);
      return;
    }
    
    const userData = {
      email,
      password,
      nombre,
      foto_perfil: fotoPerfil || ''
    };

    try {
      // Renombrada 'response' a 'registerResponse' y usada para debug
      const registerResponse = await axios.post('/api/auth/register', userData);
      console.log('Registro exitoso:', registerResponse.data);

      // Si el registro es exitoso
      setError(null);
      setSuccess(true);

      // Redirigir al usuario al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Manejar errores del backend
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un error. Por favor, inténtalo más tarde.');
      }
      setSuccess(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1 className="text-center mb-4">Registro</h1>

          {/* Mostrar mensajes de error o éxito */}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Registro exitoso. Redirigiendo al inicio de sesión...</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formNombre" className="mb-3">
              <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Contraseña <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* Componente de carga de imágenes específico para registro */}
            <RegistrationImageUploader 
              onImageUploaded={handleImageUploaded}
              initialImage={fotoPerfil}
            />

            <Button variant="primary" type="submit" className="w-100 mt-3">
              Registrarse
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;