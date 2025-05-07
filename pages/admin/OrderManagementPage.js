import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  orderBy,
  where 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  Table, 
  Button, 
  Badge, 
  Container,
  Form,
  Modal,
  Alert,
  Spinner
} from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let q;
        
        if (statusFilter === 'all') {
          q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        } else {
          q = query(
            collection(db, 'orders'),
            where('status', '==', statusFilter),
            orderBy('createdAt', 'desc')
          );
        }
        
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        
        setOrders(ordersData);
      } catch (err) {
        setError('Gagal memuat data pesanan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatus, updatedAt: new Date() } 
          : order
      ));
      
      setShowModal(false);
    } catch (err) {
      setError('Gagal memperbarui status pesanan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'processing':
        return <Badge bg="warning">Diproses</Badge>;
      case 'shipped':
        return <Badge bg="info">Dikirim</Badge>;
      case 'completed':
        return <Badge bg="success">Selesai</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Dibatalkan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch(paymentStatus) {
      case 'pending':
        return <Badge bg="warning">Menunggu</Badge>;
      case 'paid':
        return <Badge bg="success">Dibayar</Badge>;
      case 'failed':
        return <Badge bg="danger">Gagal</Badge>;
      default:
        return <Badge bg="secondary">{paymentStatus}</Badge>;
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
      <h2 className="mb-4">Manajemen Pesanan</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>Filter Status:</Form.Label>
        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Pesanan</option>
          <option value="processing">Diproses</option>
          <option value="shipped">Dikirim</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </Form.Select>
      </Form.Group>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID Pesanan</th>
            <th>Tanggal</th>
            <th>Pelanggan</th>
            <th>Total</th>
            <th>Status Pesanan</th>
            <th>Status Pembayaran</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
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
              <td>{getPaymentBadge(order.payment.status)}</td>
              <td>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowModal(true);
                  }}
                >
                  Kelola
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* Order Management Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Kelola Pesanan #{selectedOrder?.id.substring(0, 8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <h6>Detail Pelanggan</h6>
              <p>
                {selectedOrder.shipping.name}<br/>
                {selectedOrder.shipping.phone}<br/>
                {selectedOrder.shipping.address}, {selectedOrder.shipping.city} {selectedOrder.shipping.postalCode}
              </p>
              
              <h6 className="mt-3">Item Pesanan</h6>
              <ul>
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} ({item.variantLabel}) × {item.quantity} 
                    - Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                  </li>
                ))}
              </ul>
              
              <h6 className="mt-3">Total: Rp{selectedOrder.total.toLocaleString('id-ID')}</h6>
              
              <h6 className="mt-3">Status Saat Ini: {getStatusBadge(selectedOrder.status)}</h6>
              
              <Form.Group className="mt-3">
                <Form.Label>Ubah Status:</Form.Label>
                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    variant={selectedOrder.status === 'processing' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleUpdateStatus('processing')}
                  >
                    Diproses
                  </Button>
                  <Button 
                    variant={selectedOrder.status === 'shipped' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleUpdateStatus('shipped')}
                  >
                    Dikirim
                  </Button>
                  <Button 
                    variant={selectedOrder.status === 'completed' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleUpdateStatus('completed')}
                  >
                    Selesai
                  </Button>
                  <Button 
                    variant={selectedOrder.status === 'cancelled' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleUpdateStatus('cancelled')}
                  >
                    Batalkan
                  </Button>
                </div>
              </Form.Group>
              
              <h6 className="mt-3">Status Pembayaran: {getPaymentBadge(selectedOrder.payment.status)}</h6>
              <Form.Group className="mt-2">
                <Form.Label>Ubah Status Pembayaran:</Form.Label>
                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    variant={selectedOrder.payment.status === 'pending' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, 'orders', selectedOrder.id), {
                          'payment.status': 'pending',
                          updatedAt: new Date()
                        });
                        setOrders(orders.map(o => 
                          o.id === selectedOrder.id 
                            ? { ...o, payment: { ...o.payment, status: 'pending' }, updatedAt: new Date() } 
                            : o
                        ));
                      } catch (err) {
                        setError('Gagal memperbarui status pembayaran');
                        console.error(err);
                      }
                    }}
                  >
                    Menunggu
                  </Button>
                  <Button 
                    variant={selectedOrder.payment.status === 'paid' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, 'orders', selectedOrder.id), {
                          'payment.status': 'paid',
                          updatedAt: new Date()
                        });
                        setOrders(orders.map(o => 
                          o.id === selectedOrder.id 
                            ? { ...o, payment: { ...o.payment, status: 'paid' }, updatedAt: new Date() } 
                            : o
                        ));
                      } catch (err) {
                        setError('Gagal memperbarui status pembayaran');
                        console.error(err);
                      }
                    }}
                  >
                    Dibayar
                  </Button>
                  <Button 
                    variant={selectedOrder.payment.status === 'failed' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, 'orders', selectedOrder.id), {
                          'payment.status': 'failed',
                          updatedAt: new Date()
                        });
                        setOrders(orders.map(o => 
                          o.id === selectedOrder.id 
                            ? { ...o, payment: { ...o.payment, status: 'failed' }, updatedAt: new Date() } 
                            : o
                        ));
                      } catch (err) {
                        setError('Gagal memperbarui status pembayaran');
                        console.error(err);
                      }
                    }}
                  >
                    Gagal
                  </Button>
                </div>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderManagementPage;