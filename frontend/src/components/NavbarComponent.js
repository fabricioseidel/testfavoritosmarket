import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Form, FormControl } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const NavbarComponent = () => {
  const { user, logout } = useContext(UserContext); // Usamos logout del contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llamamos a la función logout del contexto
    navigate('/login'); // Redirigimos al usuario al inicio de sesión
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        {/* Título del Navbar */}
        <Navbar.Brand as={Link} to="/home">MarketPlace</Navbar.Brand>

        {/* Barra de búsqueda */}
        <Form className="d-flex mx-auto">
          <FormControl
            type="search"
            placeholder="Buscar..."
            className="me-2"
            aria-label="Buscar"
          />
          <Button variant="outline-success">Buscar</Button>
        </Form>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Opciones para usuarios no autenticados */}
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Inicio de Sesión</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
                <Nav.Link as={Link} to="/cart">Carrito</Nav.Link> {/* Ruta del carrito */}
              </>
            ) : (
              <>
                {/* Opciones para usuarios autenticados */}
                <Nav.Link as={Link} to="/favorites">Mis Favoritos</Nav.Link>
                <Nav.Link as={Link} to="/my-posts">Mis Publicaciones</Nav.Link> {/* Ruta pendiente */}
                <Nav.Link as={Link} to="/profile">Perfil</Nav.Link>
                <Nav.Link as={Link} to="/create-post">Crear Publicación</Nav.Link>
                <Button variant="outline-danger" onClick={handleLogout} className="ms-2">
                  Cerrar Sesión
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;