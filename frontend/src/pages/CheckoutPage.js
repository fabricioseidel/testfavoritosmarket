import React, { useState, useContext, useEffect } from 'react'; // Import useEffect
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '', // Pre-fill email if user is available
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  const [validated, setValidated] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Effect to handle redirection if cart becomes empty and update email from user context
  useEffect(() => {
    // Log current state for debugging
    console.log("CheckoutPage Effect: Cart length:", cart.length, "Order complete:", orderComplete, "User:", user);

    // Only redirect if the cart is empty AND the order hasn't just been completed
    if (cart.length === 0 && !orderComplete) {
      console.log("CheckoutPage Effect: Cart is empty and order not complete, navigating to /cart.");
      navigate('/cart');
    }

    // Update email in form if user context changes (e.g., after login) and differs
    if (user?.email && formData.email !== user.email) {
        console.log("CheckoutPage Effect: Updating email from user context.");
        setFormData(prev => ({ ...prev, email: user.email }));
    }
    // Add all relevant dependencies for this effect
  }, [cart, orderComplete, navigate, user, formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      console.log('Simulating payment success...');
      setOrderComplete(true); // Mark order as complete
      clearCart(); // Clear the cart via context
      setIsProcessing(false); // Stop processing indicator
    }, 1500);
  };

  // Render success message if order is complete
  if (orderComplete) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="success" className="p-5 shadow-sm">
          <span role="img" aria-label="confetti" style={{ fontSize: '3rem' }}>🎉</span>
          <h1 className="mt-3">¡Pedido Completado!</h1>
          <p className="lead mt-3">Gracias por tu compra. Hemos simulado el envío de los detalles a tu correo electrónico.</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Volver a la tienda
          </Button>
        </Alert>
      </Container>
    );
  }

  // Render the checkout form
  return (
    <Container className="my-5">
      <h1 className="mb-4">Checkout</h1>

      <Row>
        <Col md={8}>
          {/* Form starts here */}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <h4 className="mb-3">Información de Envío</h4>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="firstName">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu nombre.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu apellido.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Por favor ingresa un email válido.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                required
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Por favor ingresa tu dirección.
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={8}>
                <Form.Group controlId="city">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu ciudad.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="zip">
                  <Form.Label>Código Postal</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingresa tu código postal.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            {/* Payment Information */}
            <h4 className="mb-3">Información de Pago (Simulado)</h4>
            <Form.Group className="mb-3" controlId="cardName">
              <Form.Label>Nombre en la tarjeta</Form.Label>
              <Form.Control
                required
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                El nombre en la tarjeta es obligatorio.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="cardNumber">
              <Form.Label>Número de tarjeta</Form.Label>
              <Form.Control
                required
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                El número de tarjeta es obligatorio.
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="expDate">
                  <Form.Label>Fecha de vencimiento</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="expDate"
                    placeholder="MM/AA"
                    value={formData.expDate}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    La fecha de vencimiento es obligatoria.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="cvv">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    El código de seguridad es obligatorio.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-4"
              size="lg"
              disabled={isProcessing} // Disable button while processing
            >
              {isProcessing ? 'Procesando...' : 'Completar Compra'}
            </Button>
          </Form>
          {/* Form ends here */}
        </Col>

        {/* Order Summary */}
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Resumen de la Compra</h5>
            </Card.Header>
            <Card.Body>
              {cart.map(item => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>{item.title.substring(0, 20)}{item.title.length > 20 ? '...' : ''} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>${total.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
