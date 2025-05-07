import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Container, Row, Col, Button, Form, Alert, Image, Tab, Tabs } from 'react-bootstrap';
import { useCart } from '../../contexts/CartContext';
import Loading from '../../components/Loading';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('bottle');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Produk tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat produk');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const item = {
      id: product.id,
      name: product.name,
      image: product.images[0],
      variant: selectedVariant,
      variantLabel: getVariantLabel(selectedVariant),
      price: product.variants[selectedVariant].sellingPrice,
      quantity,
      stock: product.variants[selectedVariant].stock
    };
    
    addToCart(item);
  };

  const getVariantLabel = (variant) => {
    switch(variant) {
      case 'bottle': return `Botol ${product.variants.bottle.volume}ml`;
      case 'decant5ml': return 'Decant 5ml';
      case 'decant10ml': return 'Decant 10ml';
      default: return '';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!product) return <Alert variant="warning">Produk tidak ditemukan</Alert>;

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <Image 
            src={product.images[0]} 
            alt={product.name} 
            fluid 
            className="mb-3 rounded shadow"
          />
          <div className="d-flex gap-2">
            {product.images.slice(1).map((img, idx) => (
              <Image 
                key={idx}
                src={img} 
                alt={product.name}
                thumbnail 
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            ))}
          </div>
        </Col>
        
        <Col md={6}>
          <h1>{product.name}</h1>
          <h4 className="text-muted">{product.brand}</h4>
          
          <Tabs
            defaultActiveKey="bottle"
            id="product-variants"
            className="mb-3"
            onSelect={(k) => setSelectedVariant(k)}
          >
            <Tab eventKey="bottle" title={`Botol ${product.variants.bottle.volume}ml`}>
              <div className="my-3">
                <h3>Rp{product.variants.bottle.sellingPrice.toLocaleString('id-ID')}</h3>
                <p>Stok: {product.variants.bottle.stock}</p>
              </div>
            </Tab>
            <Tab eventKey="decant5ml" title="Decant 5ml">
              <div className="my-3">
                <h3>Rp{product.variants.decant5ml.sellingPrice.toLocaleString('id-ID')}</h3>
                <p>Stok: {product.variants.decant5ml.stock}</p>
              </div>
            </Tab>
            <Tab eventKey="decant10ml" title="Decant 10ml">
              <div className="my-3">
                <h3>Rp{product.variants.decant10ml.sellingPrice.toLocaleString('id-ID')}</h3>
                <p>Stok: {product.variants.decant10ml.stock}</p>
              </div>
            </Tab>
          </Tabs>
          
          <Form.Group className="mb-3">
            <Form.Label>Jumlah</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max={product.variants[selectedVariant].stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              style={{ width: '100px' }}
            />
          </Form.Group>
          
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleAddToCart}
            disabled={product.variants[selectedVariant].stock === 0}
          >
            {product.variants[selectedVariant].stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </Button>
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col>
          <h3>Deskripsi Produk</h3>
          <p>{product.description}</p>
          
          <h3 className="mt-4">Detail Aroma</h3>
          <ul>
            {product.fragranceNotes?.top && <li>Top Notes: {product.fragranceNotes.top}</li>}
            {product.fragranceNotes?.middle && <li>Middle Notes: {product.fragranceNotes.middle}</li>}
            {product.fragranceNotes?.base && <li>Base Notes: {product.fragranceNotes.base}</li>}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;