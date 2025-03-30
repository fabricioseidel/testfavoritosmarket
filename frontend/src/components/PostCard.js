import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const Card = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PostCard = ({ id, title, description, price, image, onClick, initialFavorite = false, onToggleFavorite }) => {
  const { user } = useContext(UserContext);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !user.token) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      const response = await axios.post(
        '/api/favorites',
        { publicacion_id: id },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newStatus = !isFavorite;
      setIsFavorite(newStatus);

      if (onToggleFavorite) {
        onToggleFavorite(id, newStatus);
      }
    } catch (err) {
      console.error('❌ Error al alternar favorito:', err.response?.data || err.message);
      alert('Ocurrió un error al modificar los favoritos.');
    }
  };

  return (
    <Card>
      <img src={image} alt={title} style={{ width: '100%' }} />
      <h3>{title}</h3>
      <p>{description}</p>
      <p><strong>Precio:</strong> ${price}</p>
      <div className="d-flex gap-2">
        <Button variant="outline-primary" onClick={onClick}>
          Ver Detalle
        </Button>

        <Button
          variant={isFavorite ? 'warning' : 'outline-warning'}
          onClick={toggleFavorite}
        >
          {isFavorite ? '💖 Quitar de Favoritos' : '🤍 Agregar a Favoritos'}
        </Button>
      </div>
    </Card>
  );
};

PostCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  initialFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};

export default PostCard;
