// src/pages/user/ProductsPage.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import ProductCard from '../../components/common/ProductCard';
import Loading from '../../components/common/Loading';
import '../../styles/pages/products.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewType, setViewType] = useState('grid');
  
  // Available filter options (could be fetched from Firestore)
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([
    'Men', 'Women', 'Unisex'
  ]);
  
  const PRODUCTS_PER_PAGE = 12;
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');
  const categoryParam = queryParams.get('category');
  const brandParam = queryParams.get('brand');
  const typeParam = queryParams.get('type');
  const sortParam = queryParams.get('sort');
  const featuredParam = queryParams.get('featured');
  
  // Initialize filters from URL params
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    
    if (brandParam) {
      setSelectedBrands([brandParam]);
    }
    
    if (sortParam) {
      setSortBy(sortParam);
    }
    
    // Reset products when filter params change
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
    
  }, [location.search]);
  
  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Start building query
        let productsQuery = collection(db, 'products');
        let constraints = [];
        
        // Apply filters
        if (searchQuery) {
          // For proper search, you might need to use Firebase extensions or a third-party solution
          // This is a simple implementation that checks if the name contains the search query
          constraints.push(where('searchKeywords', 'array-contains', searchQuery.toLowerCase()));
        }
        
        if (selectedCategories.length > 0) {
          constraints.push(where('category', 'in', selectedCategories));
        }
        
        if (selectedBrands.length > 0) {
          constraints.push(where('brand', 'in', selectedBrands));
        }
        
        if (featuredParam === 'true') {
          constraints.push(where('featured', '==', true));
        }
        
        if (typeParam === 'decant') {
          constraints.push(where('hasDecant', '==', true));
        } else if (typeParam === 'fullbottle') {
          // This assumes all products have fullBottle
        }
        
        // Apply price range filter
        constraints.push(where('fullBottlePrice', '>=', priceRange[0]));
        constraints.push(where('fullBottlePrice', '<=', priceRange[1]));
        
        // Apply sort
        let orderByField = 'createdAt';
        let orderDirection = 'desc';
        
        switch (sortBy) {
          case 'priceAsc':
            orderByField = 'fullBottlePrice';
            orderDirection = 'asc';
            break;
          case 'priceDesc':
            orderByField = 'fullBottlePrice';
            orderDirection = 'desc';
            break;
          case 'bestselling':
            orderByField = 'soldCount';
            orderDirection = 'desc';
            break;
          case 'rating':
            orderByField = 'rating';
            orderDirection = 'desc';
            break;
          case 'newest':
          default:
            orderByField = 'createdAt';
            orderDirection = 'desc';
            break;
        }
        
        // Construct final query
        let finalQuery;
        
        if (lastVisible && !loadingMore) {
          finalQuery = query(
            productsQuery,
            ...constraints,
            orderBy(orderByField, orderDirection),
            startAfter(lastVisible),
            limit(PRODUCTS_PER_PAGE)
          );
        } else {
          finalQuery = query(
            productsQuery,
            ...constraints,
            orderBy(orderByField, orderDirection),
            limit(PRODUCTS_PER_PAGE)
          );
        }
        
        // Execute query
        const productsSnapshot = await getDocs(finalQuery);
        
        // Process results
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update state
        if (loadingMore) {
          setProducts(prevProducts => [...prevProducts, ...productsData]);
        } else {
          setProducts(productsData);
        }
        
        // Update pagination info
        setLastVisible(productsSnapshot.docs[productsSnapshot.docs.length - 1] || null);
        setHasMore(productsSnapshot.docs.length === PRODUCTS_PER_PAGE);
        
        // Fetch total count (for a real app, you might want to use a counter)
        // This is a simplified approach
        setTotalProducts(products.length + (hasMore ? '+' : ''));
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    
    // Fetch available brands (for filters)
    const fetchBrands = async () => {
      try {
        // In a real app, you might want to store brands in a separate collection
        // This is a simplified approach
        const brandsSnapshot = await getDocs(
          query(collection(db, 'brands'), orderBy('name', 'asc'))
        );
        
        const brandsData = brandsSnapshot.docs.map(doc => doc.data().name);
        setAvailableBrands(brandsData);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    
    fetchProducts();
    
    // Only fetch brands once
    if (availableBrands.length === 0) {
      fetchBrands();
    }
  }, [
    searchQuery, 
    selectedCategories, 
    selectedBrands, 
    priceRange, 
    sortBy, 
    featuredParam, 
    typeParam,
    lastVisible,
    loadingMore
  ]);
  
  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
    }
  };
  
  // Handle filter changes
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
    
    // Reset pagination
    setLastVisible(null);
    setHasMore(true);
  };
  
  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
    
    // Reset pagination
    setLastVisible(null);
    setHasMore(true);
  };
  
  const handlePriceChange = (e, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setPriceRange(newPriceRange);
    
    // Reset pagination
    setLastVisible(null);
    setHasMore(true);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    
    // Update URL
    queryParams.set('sort', e.target.value);
    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    });
    
    // Reset pagination
    setLastVisible(null);
    setHasMore(true);
  };
  
  const handleViewTypeChange = (type) => {
    setViewType(type);
  };
  
  // Handle filter reset
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 10000000]);
    setSortBy('newest');
    
    // Reset URL params except search
    const newParams = new URLSearchParams();
    if (searchQuery) {
      newParams.set('search', searchQuery);
    }
    
    navigate({
      pathname: location.pathname,
      search: newParams.toString()
    });
    
    // Reset pagination
    setLastVisible(null);
    setHasMore(true);
  };
  
  return (
    <div className="products-page py-5">
      <div className="container">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3 mb-4 mb-lg-0">
            <div className="filters-wrapper sticky-lg-top">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Filters</h5>
                  <button 
                    className="btn btn-sm btn-outline-light" 
                    onClick={handleResetFilters}
                  >
                    Reset
                  </button>
                </div>
                
                <div className="card-body">
                  {/* Categories Filter */}
                  <div className="filter-section mb-4">
                    <h6 className="filter-title">Categories</h6>
                    <div className="filter-options">
                      {availableCategories.map(category => (
                        <div className="form-check" key={category}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                          />
                          <label className="form-check-label" htmlFor={`category-${category}`}>
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Brands Filter */}
                  <div className="filter-section mb-4">
                    <h6 className="filter-title">Brands</h6>
                    <div className="filter-options brands-filter">
                      {availableBrands.map(brand => (
                        <div className="form-check" key={brand}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`brand-${brand}`}
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                          />
                          <label className="form-check-label" htmlFor={`brand-${brand}`}>
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div className="filter-section mb-4">
                    <h6 className="filter-title">Price Range</h6>
                    <div className="price-range-slider">
                      <div className="range-values d-flex justify-content-between mb-2">
                        <span>Rp {priceRange[0].toLocaleString()}</span>
                        <span>Rp {priceRange[1].toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="10000000"
                        step="500000"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                      />
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="10000000"
                        step="500000"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                      />
                    </div>
                  </div>
                  
                  {/* Additional Filters */}
                  <div className="filter-section">
                    <h6 className="filter-title">Product Type</h6>
                    <div className="filter-options">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="type-fullbottle"
                          checked={typeParam === 'fullbottle'}
                          onChange={() => {
                            queryParams.set('type', typeParam === 'fullbottle' ? '' : 'fullbottle');
                            navigate({
                              pathname: location.pathname,
                              search: queryParams.toString()
                            });
                          }}
                        />
                        <label className="form-check-label" htmlFor="type-fullbottle">
                          Full Bottles
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="type-decant"
                          checked={typeParam === 'decant'}
                          onChange={() => {
                            queryParams.set('type', typeParam === 'decant' ? '' : 'decant');
                            navigate({
                              pathname: location.pathname,
                              search: queryParams.toString()
                            });
                          }}
                        />
                        <label className="form-check-label" htmlFor="type-decant">
                          Decants
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products List */}
          <div className="col-lg-9">
            {/* Results Header */}
            <div className="results-header mb-4">
              <div className="card shadow-sm">
                <div className="card-body p-3">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h4 className="mb-1">
                        {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
                      </h4>
                      <p className="text-muted mb-md-0">
                        Showing {products.length} of {totalProducts} products
                      </p>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-md-end">
                        {/* Sort Dropdown */}
                        <div className="me-3">
                          <select 
                            className="form-select" 
                            value={sortBy}
                            onChange={handleSortChange}
                          >
                            <option value="newest">Newest</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                            <option value="bestselling">Best Selling</option>
                            <option value="rating">Highest Rated</option>
                          </select>
                        </div>
                        
                        {/* View Type Toggle */}
                        <div className="btn-group">
                          <button 
                            className={`btn btn-outline-primary ${viewType === 'grid' ? 'active' : ''}`}
                            onClick={() => handleViewTypeChange('grid')}
                          >
                            <i className="bi bi-grid-3x3-gap-fill"></i>
                          </button>
                          <button 
                            className={`btn btn-outline-primary ${viewType === 'list' ? 'active' : ''}`}
                            onClick={() => handleViewTypeChange('list')}
                          >
                            <i className="bi bi-list-ul"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && !loadingMore && (
              <Loading />
            )}
            
            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted"></i>
                <h3 className="mt-3">No products found</h3>
                <p className="text-muted">
                  Try adjusting your search or filter criteria
                </p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={handleResetFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}
            
            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <div className={`products-container ${viewType === 'list' ? 'list-view' : ''}`}>
                <div className="row">
                  {products.map(product => (
                    <div 
                      key={product.id} 
                      className={viewType === 'grid' ? 'col-md-6 col-lg-4 mb-4' : 'col-12 mb-4'}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-4">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Loading...
                        </>
                      ) : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;