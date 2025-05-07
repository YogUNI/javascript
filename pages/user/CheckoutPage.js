import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    shippingMethod: 'jne',
    paymentMethod: 'transfer',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
        throw new Error('Harap lengkapi semua field yang wajib diisi');
      }
      
      // Create order in Firestore
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: cartItems,
        total: cartTotal,
        shipping: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          method: formData.shippingMethod
        },
        payment: {
          method: formData.paymentMethod,
          status: 'pending'
        },
        status: 'processing',
        notes: formData.notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart and show success message
      clearCart();
      setSuccess(`Pesanan #${docRef.id} berhasil dibuat!`);
      
      // Redirect to order confirmation
      setTimeout(() => {
        navigate(`/profile/orders/${docRef.id}`);
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Keranjang belanja Anda kosong</Alert>
        <Link to="/products">
          <Button variant="primary">Kembali ke Produk</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Checkout</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Informasi Pengiriman</Card.Title>
                
                <Form.Group className="mb-3">
                  <Form.Label>Nama Lengkap *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Nomor Telepon *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Alamat Lengkap *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Kota *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Kode Pos *</Form.Label>
                      <Form.Control
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Metode Pengiriman *</Form.Label>
                  <Form.Select
                    name="shippingMethod"
                    value={formData.shippingMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="jne">JNE Reguler</option>
                    <option value="jnt">JNT Express</option>
                    <option value="sicepat">SiCepat</option>
                    <option value="ninja">Ninja Express</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Catatan (Opsional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Catatan untuk penjual..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Body>
                <Card.Title>Metode Pembayaran</Card.Title>
                
                <Form.Group className="mb-3">
                  <Form.Label>Pilih Metode *</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="transfer">Transfer Bank</option>
                    <option value="qris">QRIS</option>
                    <option value="cod">COD (Bayar di Tempat)</option>
                  </Form.Select>
                </Form.Group>
                
                {formData.paymentMethod === 'transfer' && (
                  <div className="alert alert-info">
                    <h6>Rekening Pembayaran</h6>
                    <p className="mb-1">Bank BCA: 1234567890 (Parfum Luxury)</p>
                    <p className="mb-1">Bank Mandiri: 0987654321 (Parfum Luxury)</p>
                    <p className="mb-0">Total yang harus dibayar: <strong>Rp{cartTotal.toLocaleString('id-ID')}</strong></p>
                  </div>
                )}
                
                {formData.paymentMethod === 'qris' && (
                  <div className="alert alert-info">
                    <h6>Pembayaran via QRIS</h6>
                    <p>Scan QR code berikut untuk melakukan pembayaran:</p>
                    <div className="text-center">
                      {/* Placeholder for QR code */}
                      <div style={{ 
                        width: '200px', 
                        height: '200px', 
                        backgroundColor: '#eee',
                        display: 'inline-block',
                        marginBottom: '10px'
                      }}></div>
                      <p className="mb-0">Total: <strong>Rp{cartTotal.toLocaleString('id-ID')}</strong></p>
                    </div>
                  </div>
                )}
                
                {formData.paymentMethod === 'cod' && (
                  <div className="alert alert-info">
                    <h6>Bayar di Tempat (COD)</h6>
                    <p className="mb-0">Anda akan membayar saat paket diterima. Total: <strong>Rp{cartTotal.toLocaleString('id-ID')}</strong></p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Body>
                <Card.Title>Ringkasan Pesanan</Card.Title>
                
                <div className="mb-3">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.variant}`} className="d-flex justify-content-between mb-2">
                      <div>
                        {item.name} ({item.variantLabel}) × {item.quantity}
                      </div>
                      <div>
                        Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>Rp{cartTotal.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Ongkos Kirim:</span>
                  <span>Gratis</span>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total:</span>
                  <span>Rp{cartTotal.toLocaleString('id-ID')}</span>
                </div>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Buat Pesanan'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CheckoutPage;