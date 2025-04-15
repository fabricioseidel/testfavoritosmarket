import React, { useContext, useState } from 'react';
import { Navbar, Nav, Container, Button, Form, FormControl } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const NavbarComponent = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(''); // Añadir estado para la búsqueda

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Añadir función para manejar la búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Navbar bg="dark" expand="lg" className="shadow-sm">
      <Container>
        {/* Logo y título del Navbar */}
        <Navbar.Brand as={Link} to="/home" className="text-light d-flex align-items-center">
          <img
            src="/Logo-market.png"
            alt="Logo"
            height="50"
            className="d-inline-block align-top me-2"
          />
        </Navbar.Brand>

        {/* Barra de búsqueda - Actualizar para manejar la búsqueda */}
        <Form className="d-flex mx-auto" onSubmit={handleSearch}>
          <FormControl
            type="search"
            placeholder="Buscar..."
            className="me-2"
            aria-label="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline-light" type="submit">Buscar</Button>
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
                <Nav.Link as={Link} to="/my-posts" className="text-light">Mis Publicaciones</Nav.Link>
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