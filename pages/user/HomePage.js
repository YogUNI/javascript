// src/pages/user/HomePage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import ProductCard from '../../components/common/ProductCard';
import Loading from '../../components/common/Loading';
import '../../styles/pages/home.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch featured products
        const featuredQuery = query(
          collection(db, 'products'),
          where('featured', '==', true),
          limit(4)
        );
        
        // Fetch new arrivals
        const newArrivalsQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        
        // Fetch best sellers
        const bestSellersQuery = query(
          collection(db, 'products'),
          orderBy('soldCount', 'desc'),
          limit(4)
        );

        // Execute queries
        const [featuredSnapshot, newArrivalsSnapshot, bestSellersSnapshot] = await Promise.all([
          getDocs(featuredQuery),
          getDocs(newArrivalsQuery),
          getDocs(bestSellersQuery)
        ]);

        // Process results
        const featuredResults = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const newArrivalsResults = newArrivalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const bestSellersResults = bestSellersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Update state
        setFeaturedProducts(featuredResults);
        setNewArrivals(newArrivalsResults);
        setBestSellers(bestSellersResults);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold">Discover Your Signature Scent</h1>
              <p className="lead">
                Explore our curated collection of premium fragrances. 
                Available as full bottles or affordable decants.
              </p>
              <div className="mt-4">
                <Link to="/products" className="btn btn-primary btn-lg me-3">
                  Shop Now
                </Link>
                <Link to="/about" className="btn btn-outline-secondary btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <img 
                src="/images/hero-image.jpg" 
                alt="Collection of premium parfumes" 
                className="img-fluid rounded-3 shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Our hand-picked selection of exceptional fragrances</p>
          </div>
          
          <div className="row">
            {featuredProducts.map(product => (
              <div key={product.id} className="col-md-6 col-lg-3 mb-4">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <Link to="/products?featured=true" className="btn btn-outline-primary">
              View All Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="categories-section py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="category-card bg-primary text-white rounded-3 p-4 h-100">
                <h3>Men's Fragrances</h3>
                <p>Bold, sophisticated scents for the modern gentleman</p>
                <Link to="/products?category=men" className="btn btn-light mt-3">
                  Explore
                </Link>
              </div>
            </div>
            <div className="col-md-4">
              <div className="category-card bg-info text-white rounded-3 p-4 h-100">
                <h3>Women's Fragrances</h3>
                <p>Elegant, captivating perfumes for every occasion</p>
                <Link to="/products?category=women" className="btn btn-light mt-3">
                  Explore
                </Link>
              </div>
            </div>
            <div className="col-md-4">
              <div className="category-card bg-secondary text-white rounded-3 p-4 h-100">
                <h3>Unisex Collection</h3>
                <p>Versatile fragrances that transcend gender boundaries</p>
                <Link to="/products?category=unisex" className="btn btn-light mt-3">
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="new-arrivals-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">The latest additions to our fragrance collection</p>
          </div>
          
          <div className="row">
            {newArrivals.map(product => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3 mb-4">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <Link to="/products?sort=newest" className="btn btn-outline-primary">
              View All New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="best-sellers-section py-5 bg-light">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Our most popular fragrances loved by customers</p>
          </div>
          
          <div className="row">
            {bestSellers.map(product => (
              <div key={product.id} className="col-md-6 col-lg-3 mb-4">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <Link to="/products?sort=bestselling" className="btn btn-outline-primary">
              View All Best Sellers
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">Experience the difference with our services</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-3">
              <div className="feature-card text-center p-3">
                <div className="feature-icon mb-3">
                  <i className="bi bi-droplet-fill fs-1 text-primary"></i>
                </div>
                <h4>100% Authentic</h4>
                <p>All our fragrances are genuine and sourced directly from authorized dealers</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card text-center p-3">
                <div className="feature-icon mb-3">
                  <i className="bi bi-truck fs-1 text-primary"></i>
                </div>
                <h4>Fast Shipping</h4>
                <p>Quick and secure delivery to your doorstep across the country</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card text-center p-3">
                <div className="feature-icon mb-3">
                  <i className="bi bi-wallet2 fs-1 text-primary"></i>
                </div>
                <h4>Affordable Decants</h4>
                <p>Try premium fragrances at a fraction of the price with our decant options</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card text-center p-3">
                <div className="feature-icon mb-3">
                  <i className="bi bi-headset fs-1 text-primary"></i>
                </div>
                <h4>Expert Support</h4>
                <p>Our fragrance experts are ready to assist you with any questions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="newsletter-section py-5 bg-dark text-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h3>Subscribe To Our Newsletter</h3>
              <p className="mb-4">Stay updated with new arrivals, exclusive offers, and fragrance tips</p>
              <form className="newsletter-form">
                <div className="input-group mb-3">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your email address" 
                    required
                  />
                  <button className="btn btn-primary" type="submit">Subscribe</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;