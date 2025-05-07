import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get total products
        const productsQuery = collection(db, 'products');
        const productsSnapshot = await getDocs(productsQuery);
        
        // Get orders data
        const ordersQuery = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersQuery);
        
        // Get recent orders
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        
        // Calculate stats
        const completedOrders = ordersSnapshot.docs.filter(
          doc => doc.data().status === 'completed'
        );
        
        const monthlyRevenue = completedOrders.reduce(
          (total, doc) => total + doc.data().total,
          0
        );
        
        const pendingOrders = ordersSnapshot.docs.filter(
          doc => doc.data().status === 'processing'
        ).length;
        
        // Set states
        setStats({
          totalProducts: productsSnapshot.size,
          totalOrders: ordersSnapshot.size,
          monthlyRevenue,
          pendingOrders
        });
        
        setRecentOrders(recentOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })));
        
      } catch (err) {
        setError('Gagal memuat data dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'processing':
        return <span className="badge bg-warning">Diproses</span>;
      case 'shipped':
        return <span className="badge bg-info">Dikirim</span>;
      case 'completed':
        return <span className="badge bg-success">Selesai</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Dibatalkan</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
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
      <h2 className="mb-4">Dashboard Admin</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Produk</Card.Title>
              <Card.Text className="display-6">
                {stats.totalProducts}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Pesanan</Card.Title>
              <Card.Text className="display-6">
                {stats.totalOrders}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pendapatan Bulan Ini</Card.Title>
              <Card.Text className="display-6">
                Rp{stats.monthlyRevenue.toLocaleString('id-ID')}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pesanan Pending</Card.Title>
              <Card.Text className="display-6">
                {stats.pendingOrders}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Pesanan Terbaru</Card.Title>
          
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id.substring(0, 8)}</td>
                  <td>
                    {order.createdAt 
                      ? format(order.createdAt, 'dd MMM yyyy HH:mm', { locale: id }) 
                      : '-'}
                  </td>
                  <td>{order.userEmail}</td>
                  <td>Rp{order.total.toLocaleString('id-ID')}</td>
                  <td>{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Produk Stok Rendah</Card.Title>
              <p className="text-muted">(Fitur ini akan menampilkan produk dengan stok hampir habis)</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Grafik Penjualan</Card.Title>
              <p className="text-muted">(Fitur ini akan menampilkan grafik penjualan bulanan)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;