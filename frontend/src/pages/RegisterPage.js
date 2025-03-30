import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Para redirigir al usuario después del registro

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!email || !password || !nombre || !fotoPerfil) {
      setError('Por favor, completa todos los campos.');
      setSuccess(false);
      return;
    }

    try {
      // Enviar solicitud al backend
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        nombre,
        foto_perfil: fotoPerfil,
      });

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
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formFotoPerfil" className="mb-3">
              <Form.Label>Foto de Perfil (URL)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa la URL de tu foto de perfil"
                value={fotoPerfil}
                onChange={(e) => setFotoPerfil(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Registrarse
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;