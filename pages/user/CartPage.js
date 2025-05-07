import React from 'react';
import { Container, Table, Button, Row, Col, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';

const CartPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    cartCount,
    clearCart 
  } = useCart();
  const { currentUser } = useAuth();

  const handleCheckout = () => {
    if (!currentUser) {
      alert('Anda harus login terlebih dahulu untuk checkout');
      return;
    }
    // Proses checkout akan dilanjutkan di CheckoutPage
  };

  if (cartCount === 0) {
    return (
      <Container className="py-5 text-center">
        <h2>Keranjang Belanja Kosong</h2>
        <p>Silahkan tambahkan produk terlebih dahulu</p>
        <Link to="/products">
          <Button variant="primary">Lihat Produk</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Keranjang Belanja</h2>
      
      <Row>
        <Col md={8}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Varian</th>
                <th>Harga</th>
                <th>Jumlah</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={`${item.id}-${item.variant}`}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                      />
                      {item.name}
                    </div>
                  </td>
                  <td>{item.variantLabel}</td>
                  <td>Rp{item.price.toLocaleString('id-ID')}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, item.variant, parseInt(e.target.value))}
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => removeFromCart(item.id, item.variant)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <Button 
            variant="outline-danger" 
            onClick={clearCart}
            className="mb-4"
          >
            Kosongkan Keranjang
          </Button>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Ringkasan Belanja</Card.Title>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Total ({cartCount} item):</span>
                <span>Rp{cartTotal.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Ongkos Kirim:</span>
                <span>Gratis</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between fw-bold mb-4">
                <span>Total Pembayaran:</span>
                <span>Rp{cartTotal.toLocaleString('id-ID')}</span>
              </div>
              
              <Button 
                variant="primary" 
                className="w-100"
                onClick={handleCheckout}
                as={Link}
                to={currentUser ? "/checkout" : "/login"}
              >
                Proses Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;