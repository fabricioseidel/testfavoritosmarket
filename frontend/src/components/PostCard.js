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
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 12px;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PostCard = ({ id, title, description, price, image, onClick, initialFavorite = false, onToggleFavorite, viewMode = 'grid' }) => {
  const { user } = useContext(UserContext);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(initialFavorite);
    
    // Si el usuario está autenticado, verificar si el post está en favoritos
    if (user?.token && id) {
      axios.get(`/api/favorites/check/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(response => {
        setIsFavorite(response.data.isFavorite);
      })
      .catch(error => {
        console.error("Error verificando favorito:", error);
      });
    }
  }, [initialFavorite, id, user]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !user.token) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      await axios.post(
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

  const CardComponent = viewMode === 'grid' ? (
    <Card>
      <ImageContainer>
        <ProductImage src={image} alt={title} />
      </ImageContainer>
      <h3>{title}</h3>
      <p>{description.length > 100 ? `${description.substring(0, 100)}...` : description}</p>
      <p><strong>Precio:</strong> ${price}</p>
      <div className="d-flex gap-2">
        <Button variant="outline-primary" onClick={onClick}>
          Ver Detalle
        </Button>

        {user && (
          <Button
            variant={isFavorite ? "warning" : "outline-warning"}
            onClick={toggleFavorite}
            disabled={isTogglingFavorite}
          >
            {isFavorite ? '💖' : '🤍'}
          </Button>
        )}
      </div>
    </Card>
  ) : (
    <Card className="d-flex flex-row p-3">
      <ImageContainer style={{ width: '200px', height: '150px' }}>
        <ProductImage src={image} alt={title} />
      </ImageContainer>
      <div className="ms-3 flex-grow-1">
        <h3>{title}</h3>
        <p>{description.length > 200 ? `${description.substring(0, 200)}...` : description}</p>
        <p><strong>Precio:</strong> ${price}</p>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={onClick}>
            Ver Detalle
          </Button>

          {user && (
            <Button
              variant={isFavorite ? "warning" : "outline-warning"}
              onClick={toggleFavorite}
              disabled={isTogglingFavorite}
            >
              {isFavorite ? '💖 Quitar de Favoritos' : '🤍 Agregar a Favoritos'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return CardComponent;
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
  viewMode: PropTypes.oneOf(['grid', 'list']),
};

export default PostCard;
