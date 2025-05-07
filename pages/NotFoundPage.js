import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

const NotFoundPage = () => {
  return (
    <Container className="text-center py-5">
      <h1>404 - Halaman Tidak Ditemukan</h1>
      <p>Maaf, halaman yang Anda cari tidak ada.</p>
      <Link to="/">
        <Button variant="primary">Kembali ke Beranda</Button>
      </Link>
    </Container>
  );
};

export default NotFoundPage;