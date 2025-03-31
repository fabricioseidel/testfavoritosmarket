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
    <Navbar bg="dark" expand="lg" className="shadow-sm">
      <Container>
        {/* Logo y título del Navbar */}
        <Navbar.Brand as={Link} to="/home" className="text-light d-flex align-items-center">
          <img
            src="/Logo-market.png" // Asegúrate de que la imagen esté en la carpeta public
            alt="Logo"
            height="50"
            className="d-inline-block align-top me-2"
          />
          
        </Navbar.Brand>

        {/* Barra de búsqueda */}
        <Form className="d-flex mx-auto">
          <FormControl
            type="search"
            placeholder="Buscar..."
            className="me-2"
            aria-label="Buscar"
          />
          <Button variant="outline-light">Buscar</Button>
        </Form>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav ">
          <Nav className="ms-auto">
            {/* Opciones para usuarios no autenticados */}
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login" className="text-light">Inicio de Sesión</Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-light">Registrarse</Nav.Link>
                <Nav.Link as={Link} to="/cart" className="text-light">Carrito</Nav.Link> {/* Ruta del carrito */}
              </>
            ) : (
              <>
                {/* Opciones para usuarios autenticados */}
                <Nav.Link as={Link} to="/favorites" className="text-light">Mis Favoritos</Nav.Link>
                <Nav.Link as={Link} to="/my-posts" className="text-light">Mis Publicaciones</Nav.Link> {/* Ruta pendiente */}
                <Nav.Link as={Link} to="/profile" className="text-light">Perfil</Nav.Link>
                <Nav.Link as={Link} to="/create-post" className="text-light">Crear Publicación</Nav.Link>
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