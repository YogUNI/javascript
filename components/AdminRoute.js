import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }

  if (!currentUser || !currentUser.email.endsWith('@admin.com')) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;