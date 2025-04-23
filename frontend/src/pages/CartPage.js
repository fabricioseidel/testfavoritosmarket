import React, { useState } from 'react'; // Import useState
import { Container, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap'; // Import Alert
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [paymentApproved, setPaymentApproved] = useState(false); // State for payment status

  // Handler for the payment button
  const handleProceedToPayment = () => {
    console.log('Simulating payment approval...');
    clearCart(); // Clear the cart via context
    setPaymentApproved(true); // Set payment status to approved
  };

  // If payment is approved, show success message
  if (paymentApproved) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="success" className="p-5 shadow-sm">
          <span role="img" aria-label="check mark" style={{ fontSize: '3rem' }}>✅</span>
          <h1 className="mt-3">PAGO APROBADO</h1>
          <p className="lead mt-3">Tu compra ha sido procesada exitosamente.</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Regresar al inicio
          </Button>
        </Alert>
      </Container>
    );
  }

  // Si el carrito está vacío (y payment not approved)
  if (cart.length === 0) {
    return (
      <Container className="my-5 py-3">
        <div className="text-center">
          <span className="fs-1">🛒</span>
          <h2>Tu carrito está vacío</h2>
          <p className="text-muted">¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
          <Button 
            variant="primary" 
            className="mt-3"
            onClick={() => navigate('/')}
          >
            ← Ir a comprar
          </Button>
        </div>
      </Container>
    );
  }

  // Render cart view if not empty and payment not approved
  return (
    <Container className="my-5">
      <h1 className="mb-4">Tu Carrito</h1>

      <Table responsive hover>
        <thead className="bg-light">
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} className="align-middle">
              <td>
                <div className="d-flex align-items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    className="me-3"
                  />
                  <Link to={`/post/${item.id}`} className="text-decoration-none text-dark">
                    {item.title}
                  </Link>
                </div>
              </td>
              <td>${item.price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              <td style={{ width: '150px' }}>
                <Form.Control
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="form-control-sm"
                />
              </td>
              <td>${(item.price * item.quantity).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row className="mt-4">
        <Col md={6}>
          <Button
            variant="outline-danger"
            onClick={clearCart} // Keep original clear cart button functionality
          >
            Vaciar carrito
          </Button>
        </Col>
        <Col md={6}>
          <div className="bg-light p-4 rounded">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <strong>${total.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <h5>Total:</h5>
              <h5>${total.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h5>
            </div>
            <Button
              variant="success"
              className="w-100"
              onClick={handleProceedToPayment} // Use the new handler
            >
              Proceder al pago
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
