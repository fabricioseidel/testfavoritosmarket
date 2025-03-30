import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser(); // Usar la función login del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      setSuccess(false);
      return;
    }

    try {
      // Enviar solicitud al backend
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      // Si el inicio de sesión es exitoso
      setError(null);
      setSuccess(true);

      // Actualizar el estado del usuario en el contexto
      login(response.data);

      // Redirigir a la página principal
      navigate('/home');
    } catch (err) {
      // Manejar errores del backend
      if (err.response && err.response.status === 404) {
        setError('Usuario no encontrado.');
      } else if (err.response && err.response.status === 401) {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
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
          <h1 className="text-center mb-4">Inicio de Sesión</h1>

          {/* Mostrar mensajes de error o éxito */}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Inicio de sesión exitoso.</Alert>}

          <Form onSubmit={handleSubmit}>
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

            <Button variant="primary" type="submit" className="w-100">
              Iniciar Sesión
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;