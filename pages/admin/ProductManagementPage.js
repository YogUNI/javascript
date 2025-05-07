import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  addDoc,
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Alert, 
  Spinner,
  Container,
  Row,
  Col,
  Card
} from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { currentUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    fragranceNotes: {
      top: '',
      middle: '',
      base: ''
    },
    variants: {
      bottle: {
        volume: 50,
        costPrice: 0,
        sellingPrice: 0,
        stock: 0
      },
      decant5ml: {
        costPrice: 0,
        sellingPrice: 0,
        stock: 0
      },
      decant10ml: {
        costPrice: 0,
        sellingPrice: 0,
        stock: 0
      }
    }
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (err) {
        setError('Gagal memuat produk');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.startsWith('fragranceNotes.')) {
      const noteType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        fragranceNotes: {
          ...prev.fragranceNotes,
          [noteType]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleVariantChange = (variant, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variant]: {
          ...prev.variants[variant],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const uploadImages = async () => {
    const imageUrls = [];
    
    for (const file of imageFiles) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }
    
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrls = [];
      
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }
      
      const productData = {
        ...formData,
        images: imageUrls.length > 0 ? imageUrls : (editingProduct?.images || [])
      };
      
      if (editingProduct) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        setProducts(products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ));
      } else {
        // Add new product
        const docRef = await addDoc(collection(db, 'products'), productData);
        setProducts([...products, { id: docRef.id, ...productData }]);
      }
      
      handleCloseModal();
    } catch (err) {
      setError('Gagal menyimpan produk');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      description: product.description,
      fragranceNotes: product.fragranceNotes || {
        top: '',
        middle: '',
        base: ''
      },
      variants: product.variants
    });
    setPreviewUrls(product.images || []);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products.filter(p => p.id !== productId));
      } catch (err) {
        setError('Gagal menghapus produk');
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      description: '',
      fragranceNotes: {
        top: '',
        middle: '',
        base: ''
      },
      variants: {
        bottle: {
          volume: 50,
          costPrice: 0,
          sellingPrice: 0,
          stock: 0
        },
        decant5ml: {
          costPrice: 0,
          sellingPrice: 0,
          stock: 0
        },
        decant10ml: {
          costPrice: 0,
          sellingPrice: 0,
          stock: 0
        }
      }
    });
    setPreviewUrls([]);
    setImageFiles([]);
  };

  if (!currentUser || !currentUser.email.endsWith('@admin.com')) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Akses ditolak. Hanya admin yang bisa mengakses halaman ini.</Alert>
      </Container>
    );
  }

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Manajemen Produk</h2>
          <Button onClick={() => setShowModal(true)}>Tambah Produk Baru</Button>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Brand</th>
            <th>Botol</th>
            <th>Decant 5ml</th>
            <th>Decant 10ml</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.brand}</td>
              <td>
                Rp{product.variants.bottle.sellingPrice.toLocaleString('id-ID')}<br/>
                Stok: {product.variants.bottle.stock}
              </td>
              <td>
                Rp{product.variants.decant5ml.sellingPrice.toLocaleString('id-ID')}<br/>
                Stok: {product.variants.decant5ml.stock}
              </td>
              <td>
                Rp{product.variants.decant10ml.sellingPrice.toLocaleString('id-ID')}<br/>
                Stok: {product.variants.decant10ml.stock}
              </td>
              <td>
                <Button 
                  variant="warning" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Parfum</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                <h5>Detail Aroma</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Top Notes</Form.Label>
                  <Form.Control
                    type="text"
                    name="fragranceNotes.top"
                    value={formData.fragranceNotes.top}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Middle Notes</Form.Label>
                  <Form.Control
                    type="text"
                    name="fragranceNotes.middle"
                    value={formData.fragranceNotes.middle}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Base Notes</Form.Label>
                  <Form.Control
                    type="text"
                    name="fragranceNotes.base"
                    value={formData.fragranceNotes.base}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gambar Produk</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {previewUrls.map((url, idx) => (
                      <img 
                        key={idx}
                        src={url} 
                        alt="Preview" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    ))}
                  </div>
                </Form.Group>
                
                <Card className="mb-3">
                  <Card.Header>Varian Botol</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Volume (ml)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.bottle.volume}
                        onChange={(e) => handleVariantChange('bottle', 'volume', e.target.value)}
                        min="1"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Harga Modal</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.bottle.costPrice}
                        onChange={(e) => handleVariantChange('bottle', 'costPrice', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Harga Jual</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.bottle.sellingPrice}
                        onChange={(e) => handleVariantChange('bottle', 'sellingPrice', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Stok</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.bottle.stock}
                        onChange={(e) => handleVariantChange('bottle', 'stock', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
                
                <Card className="mb-3">
                  <Card.Header>Varian Decant 5ml</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Harga Modal</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.decant5ml.costPrice}
                        onChange={(e) => handleVariantChange('decant5ml', 'costPrice', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Harga Jual</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.decant5ml.sellingPrice}
                        onChange={(e) => handleVariantChange('decant5ml', 'sellingPrice', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Stok</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.decant5ml.stock}
                        onChange={(e) => handleVariantChange('decant5ml', 'stock', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
                
                <Card>
                  <Card.Header>Varian Decant 10ml</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Harga Modal</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.decant10ml.costPrice}
                        onChange={(e) => handleVariantChange('decant10ml', 'costPrice', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Harga Jual</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.decant10ml.sellingPrice}
                        onChange={(e) => handleVariantChange('decant10ml', 'sellingPrice', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Stok</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.variants.decant10ml.stock}
                        onChange={(e) => handleVariantChange('decant10ml', 'stock', e.target.value)}
                        min="0"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" /> Menyimpan...
                </>
              ) : (
                'Simpan Produk'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductManagementPage;