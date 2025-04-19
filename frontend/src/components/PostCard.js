import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { favoriteService, postService } from '../services/apiClient';

const StyledCard = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
  
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
  position: relative;
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

const PostCard = ({ id, title, price, description, image, onFavorite, onClaim }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const { user } = useContext(UserContext);
  const { cart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    const productInCart = cart.find(item => item.id === id);
    setIsInCart(!!productInCart);
  }, [cart, id]);
  
  useEffect(() => {
    if (!user || checkingFavorite) return;

    const checkFavoriteStatus = async () => {
      setCheckingFavorite(true);
      console.log(`PostCard (${id}): Checking favorite status...`);
      try {
        const response = await favoriteService.checkFavorite(id);
        console.log(`PostCard (${id}): checkFavorite response:`, response.data);
        if (response.data && typeof response.data.isFavorite === 'boolean') {
          setIsFavorite(response.data.isFavorite);
          console.log(`PostCard (${id}): Status set to ${response.data.isFavorite}`);
        } else {
          console.warn(`PostCard (${id}): Invalid response from checkFavorite`, response.data);
          setIsFavorite(false);
        }
      } catch (error) {
        console.error(`PostCard (${id}): Error checking favorite status:`, error.response?.data || error.message);
      } finally {
        setCheckingFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [id, user, checkingFavorite]);

  const toggleFavoriteHandler = async (e) => {
    e.stopPropagation();
    
    if (!user?.token) {
      alert('Debes iniciar sesión para añadir a favoritos');
      return;
    }

    try {
      const response = await favoriteService.toggleFavorite(id);
      setIsFavorite(response.data.isFavorite);
      
      if (onFavorite) {
        onFavorite(id, response.data.isFavorite);
      }
    } catch (error) {
      console.error('Error al gestionar favorito:', error.response?.data?.error || error.message);
      alert('Error al gestionar favorito');
    }
  };

  const handleClaimHandler = async (e) => {
    e.stopPropagation();

    if (!user?.token) {
      alert('Debes iniciar sesión para reclamar esta publicación');
      return;
    }

    try {
      const claimResponse = await postService.claimPost(id);
      
      console.log('Publicación reclamada:', claimResponse.data);
      
      alert('Publicación reclamada exitosamente');
      
      if (onClaim) {
        onClaim(id);
      }
    } catch (error) {
      console.error('Error al reclamar publicación:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Error al reclamar la publicación');
    }
  };
  
  const handleCartAction = (e) => {
    e.stopPropagation();
    
    const product = {
      id,
      title,
      description,
      price,
      image,
      quantity: 1
    };
    
    if (isInCart) {
      removeFromCart(id);
      
      const tempAlert = document.createElement('div');
      tempAlert.className = 'position-fixed bottom-0 end-0 p-3';
      tempAlert.style.zIndex = 1050;
      tempAlert.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-body bg-info text-white">
            ✓ Producto eliminado del carrito
          </div>
        </div>
      `;
      document.body.appendChild(tempAlert);
      setTimeout(() => document.body.removeChild(tempAlert), 2000);
    } else {
      addToCart(product);
      
      const tempAlert = document.createElement('div');
      tempAlert.className = 'position-fixed bottom-0 end-0 p-3';
      tempAlert.style.zIndex = 1050;
      tempAlert.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-body bg-success text-white">
            ✓ Producto añadido al carrito
          </div>
        </div>
      `;
      document.body.appendChild(tempAlert);
      setTimeout(() => document.body.removeChild(tempAlert), 2000);
    }
  };

  return (
    <StyledCard>
      <ImageContainer>
        <ProductImage src={image} alt={title} />
        {isInCart && (
          <Badge 
            bg="success" 
            className="position-absolute top-0 end-0 m-2 p-2"
            style={{ zIndex: 10 }}
          >
            En Carrito
          </Badge>
        )}
      </ImageContainer>
      <h3>{title}</h3>
      <p>{description.length > 100 ? `${description.substring(0, 100)}...` : description}</p>
      <p><strong>Precio:</strong> ${price}</p>
      <div className="d-flex gap-2 flex-wrap mt-auto pt-3">
        <Button variant="outline-primary" size="sm" onClick={() => navigate(`/post/${id}`)}>
          Ver Detalle
        </Button>
        
        <Button 
          variant={isInCart ? "outline-success" : "success"}
          size="sm"
          onClick={handleCartAction}
        >
          {isInCart ? '✓ En Carrito' : '🛒 Añadir'}
        </Button>
        
        {user && (
          <Button
            variant={isFavorite ? "warning" : "outline-warning"}
            size="sm"
            onClick={toggleFavoriteHandler}
            disabled={checkingFavorite}
            className={isFavorite ? "favorite-active" : ""}
          >
            {checkingFavorite ? <Spinner as="span" animation="border" size="sm" /> : (isFavorite ? '💖' : '🤍')}
          </Button>
        )}
        
        {onClaim && user && (
          <Button 
            variant="outline-success"
            onClick={handleClaimHandler}
          >
            ✋ Reclamar
          </Button>
        )}
      </div>
    </StyledCard>
  );
};

PostCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  onClaim: PropTypes.func,
  onFavorite: PropTypes.func
};

export default PostCard;
