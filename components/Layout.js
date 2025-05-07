import React from 'react';
import Header from './common/Header';  // Perlu disesuaikan
import Footer from './common/Footer';  // Perlu disesuaikan
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;