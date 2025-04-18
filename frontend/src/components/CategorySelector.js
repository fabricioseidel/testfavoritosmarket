import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { categoryService } from '../services/apiClient';
import apiClient from '../services/apiClient';

const CategorySelector = ({ value, onChange, name = "categoria_id", label = "Categoría", required = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/categories', { signal });

        if (Array.isArray(response.data)) {
          setCategories(response.data);
          console.log('Categorías cargadas:', response.data.length);
        } else {
          console.error('Error: La API no devolvió un array para categorías:', response.data);
          setError('Error: Formato de datos inesperado recibido del servidor.');
          setCategories([]);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Solicitud de categorías cancelada');
        } else {
          console.error('Error al cargar categorías:', err);
          setError(err.response?.data?.error || err.message || 'Error al cargar categorías');
          setCategories([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Form.Group controlId={name} className="mb-3">
      <Form.Label>{label}{required && <span className="text-danger">*</span>}</Form.Label>
      <Form.Select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={loading || error}
      >
        <option value="">{loading ? 'Cargando...' : error ? 'Error al cargar' : 'Selecciona una categoría'}</option>
        {Array.isArray(categories) && categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.nombre}
          </option>
        ))}
      </Form.Select>
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
      <Form.Control.Feedback type="invalid">
        Por favor selecciona una categoría.
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default CategorySelector;
