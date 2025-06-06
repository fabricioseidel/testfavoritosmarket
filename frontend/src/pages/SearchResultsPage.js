import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button, Form, ButtonGroup, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CategorySelector from '../components/CategorySelector'; // Importar CategorySelector
import { postService } from '../services/apiClient'; // Importar postService
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaSearch, FaThList, FaThLarge } from 'react-icons/fa';

const FilterSection = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const ResultCount = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 1rem 0;
`;

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || ''); // Estado para categoría
  const [abortController, setAbortController] = useState(null); // Para cancelar peticiones

  const query = searchParams.get('q');
  const categoryFilter = searchParams.get('category'); // Leer categoría de la URL

  useEffect(() => {
    // Actualizar searchTerm y selectedCategory si cambian los parámetros en la URL
    setSearchTerm(query || '');
    setSelectedCategory(categoryFilter || '');

    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    setAbortController(controller); // Guardar nuevo controlador
    const signal = controller.signal;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usar postService.searchPosts
        const response = await postService.searchPosts(query, categoryFilter, { signal }); // Pasar query y categoryFilter

        if (Array.isArray(response.data)) {
          setResults(response.data);
        } else {
          console.error('API search did not return an array:', response.data);
          setError('Formato de respuesta inesperado del servidor.');
          setResults([]);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Búsqueda cancelada');
        } else {
          console.error('Error fetching search results:', err);
          setError(err.response?.data?.error || err.message || 'Error al realizar la búsqueda.');
          setResults([]);
        }
      } finally {
        // Solo poner loading false si esta petición no fue cancelada
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      controller.abort(); // Cancelar al desmontar o cambiar query o categoryFilter
    };
  }, [query, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (searchTerm.trim()) newParams.q = searchTerm.trim();
    if (selectedCategory) newParams.category = selectedCategory; // Mantener categoría al buscar texto
    setSearchParams(newParams);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId); // Actualizar estado local
    // Actualizar URL params para reflejar el cambio de categoría
    const newParams = {};
    if (query) newParams.q = query; // Mantener query si existe
    if (categoryId) newParams.category = categoryId;
    setSearchParams(newParams);
  };

  return (
    <Container className="my-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h1>
          Resultados de Búsqueda
          {query && ` para "${query}"`}
          {categoryFilter && ` en categoría seleccionada`} {/* Mejorar mensaje */}
        </h1>

        <FilterSection>
          <Form onSubmit={handleSearchSubmit} className="mb-3">
            <Row>
              <Col md={8}>
                <Form.Control
                  type="search"
                  placeholder="Buscar por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="me-2"
                />
              </Col>
              <Col md={4}>
                {/* Usar CategorySelector aquí */}
                <CategorySelector
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="" // Ocultar label si se desea
                  required={false}
                  name="categoryFilter" // Nombre único para el control
                />
              </Col>
            </Row>
            <Button variant="primary" type="submit" className="mt-2 w-100"><FaSearch /> Buscar</Button>
          </Form>
          <div className="d-flex justify-content-between align-items-center">
            <ResultCount>{results.length} resultado(s) encontrado(s)</ResultCount>
            <ButtonGroup>
              <Button variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'} onClick={() => setViewMode('grid')}><FaThLarge /></Button>
              <Button variant={viewMode === 'list' ? 'primary' : 'outline-secondary'} onClick={() => setViewMode('list')}><FaThList /></Button>
            </ButtonGroup>
          </div>
        </FilterSection>

        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : results.length === 0 ? (
          <Alert variant="info">No se encontraron publicaciones que coincidan con tu búsqueda o filtro.</Alert>
        ) : (
          <Row className={viewMode === 'grid' ? '' : 'flex-column'}>
            {results.map(post => (
              <Col
                key={post.id}
                xs={12}
                sm={viewMode === 'grid' ? 6 : 12}
                md={viewMode === 'grid' ? 4 : 12}
                lg={viewMode === 'grid' ? 3 : 12}
                className="mb-4"
              >
                <PostCard
                  id={post.id}
                  title={post.titulo}
                  description={post.descripcion}
                  price={parseFloat(post.precio)}
                  image={post.imagen}
                />
              </Col>
            ))}
          </Row>
        )}
      </motion.div>
    </Container>
  );
};

export default SearchResultsPage;
