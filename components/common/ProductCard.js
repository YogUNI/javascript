import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  
  const getLowestPrice = () => {
    const prices = [
      product.variants?.bottle?.sellingPrice || Infinity,
      product.variants?.decant5ml?.sellingPrice || Infinity,
      product.variants?.decant10ml?.sellingPrice || Infinity
    ];
    return Math.min(...prices);
  };

  return (
    <Card className="h-100 shadow-sm">
      <div className="ratio ratio-1x1">
        <Card.Img 
          variant="top" 
          src={product.images[0]} 
          alt={product.name}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title>{product.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{product.brand}</Card.Subtitle>
        
        <div className="mb-2">
          <Badge bg="secondary" className="me-1">Bottle: {product.variants?.bottle?.volume}ml</Badge>
          <Badge bg="secondary" className="me-1">Decant 5ml</Badge>
          <Badge bg="secondary">Decant 10ml</Badge>
        </div>
        
        <Card.Text className="fw-bold mt-auto">
          Mulai dari Rp{getLowestPrice().toLocaleString('id-ID')}
        </Card.Text>
        
        <Link to={`/products/${product.id}`}>
          <Button variant="primary" className="w-100">
            {currentUser ? 'Beli Sekarang' : 'Lihat Detail'}
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;