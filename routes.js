import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Components
import Loading from './components/common/Loading';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';

// Lazy loading
const HomePage = lazy(() => import('./pages/user/HomePage'));
const ProductPage = lazy(() => import('./pages/user/ProductPage'));
const ProductDetailPage = lazy(() => import('./pages/user/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/user/CartPage'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProductManagementPage = lazy(() => import('./pages/admin/ProductManagementPage'));
const OrderManagementPage = lazy(() => import('./pages/admin/OrderManagementPage'));
const ReportPage = lazy(() => import('./pages/admin/ReportPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Tambahkan import untuk halaman Login (jika belum ada)
const LoginPage = lazy(() => import('./pages/user/LoginPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Redirect dari "/" ke halaman login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Layout dengan Header dan Footer untuk halaman publik dan user */}
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* User Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        
        {/* Admin Routes (tanpa Layout user) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/products" element={<ProductManagementPage />} />
          <Route path="/admin/orders" element={<OrderManagementPage />} />
          <Route path="/admin/reports" element={<ReportPage />} />
        </Route>
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;