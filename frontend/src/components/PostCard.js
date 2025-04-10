import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const DEFAULT_IMAGE = '/placeholder-image.jpg'; // Asegúrate de tener esta imagen en la carpeta public

const StyledCard = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  ${({ $viewMode }) => $viewMode === 'list' && `
    display: flex;
    align-items: center;
    
    img {
      width: 200px;
      height: 200px;
      object-fit: cover;
      margin-right: 2rem;
    }
    
    .content {
      flex: 1;
    }
  `}
`;

const PostCard = ({ id, title, description, price, image, onClick, initialFavorite = false, onToggleFavorite, viewMode = 'grid' }) => {
  const { user } = useContext(UserContext);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  const decodeText = (text) => {
    try {
      return decodeURIComponent(escape(text));
    } catch (e) {
      return text;
    }
  };

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

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <StyledCard $viewMode={viewMode}>
      <img 
        src={imageError ? DEFAULT_IMAGE : image} 
        alt={decodeText(title)} 
        onError={handleImageError}
        style={viewMode === 'grid' ? { width: '100%', height: '200px', objectFit: 'cover' } : undefined} 
      />
      <div className="content">
        <h3>{decodeText(title)}</h3>
        <p>{decodeText(description)}</p>
        <p><strong>Precio:</strong> ${price}</p>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={onClick}>
            Ver Detalle
          </Button>
          <Button
            variant={isFavorite ? 'warning' : 'outline-warning'}
            onClick={toggleFavorite}
          >
            {isFavorite ? '💖' : '🤍'}
          </Button>
        </div>
      </div>
    </StyledCard>
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
  viewMode: PropTypes.string,
};

export default PostCard;
