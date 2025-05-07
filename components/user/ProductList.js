import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import ProductCard from '../common/ProductCard';
import Loading from '../common/Loading';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name-asc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const urlParams = new URLSearchParams(location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
          setFilterCategory(categoryParam);
        }
        
        let productsQuery = collection(db, 'products');
        const queryConstraints = [];
        
        // Apply filters from URL or state
        if (filterCategory !== 'all') {
          queryConstraints.push(where('category', '==', filterCategory));
        }
        
        if (filterGender !== 'all') {
          queryConstraints.push(where('gender', '==', filterGender));
        }
        
        // Apply sorting
        const [sortField, sortDirection] = sortBy.split('-');
        queryConstraints.push(orderBy(sortField, sortDirection));
        
        productsQuery = query(productsQuery, ...queryConstraints);
        
        const productsSnapshot = await getDocs(productsQuery);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [location.search, filterCategory, filterGender, sortBy]);
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFilterCategory(category);
    
    // Update URL
    const params = new URLSearchParams(location.search);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  const handleGenderChange = (e) => {
    setFilterGender(e.target.value);
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Our Perfume Collection</h1>
      
      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label>Sort By</Form.Label>
            <Form.Select value={sortBy} onChange={handleSortChange}>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="fullBottlePrice-asc">Price (Low to High)</option>
              <option value="fullBottlePrice-desc">Price (High to Low)</option>
              <option value="createdAt-desc">Newest First</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={4} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select value={filterCategory} onChange={handleCategoryChange}>
              <option value="all">All Categories</option>
              <option value="Fresh">Fresh</option>
              <option value="Woody">Woody</option>
              <option value="Oriental">Oriental</option>
              <option value="Floral">Floral</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={4}>
          <Form.Group>
            <Form.Label>Gender</Form.Label>
            <Form.Select value={filterGender} onChange={handleGenderChange}>
              <option value="all">All</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      {products.length === 0 ? (
        <div className="text-center py-5">
          <h3>No products found</h3>
          <p>Try changing your filter options or check back later.</p>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {products.map(product => (
            <Col key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default ProductList;