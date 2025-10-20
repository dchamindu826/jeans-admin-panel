// frontend/src/components/Auth/ProtectedAdminRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  // 'jeansFactoryAdmin' kiyala item ekak local storage eke tiyenavaḍa balanava
  const isAdminLoggedIn = localStorage.getItem('jeansFactoryAdmin');

  if (!isAdminLoggedIn) {
    // Login vī nætnam, Login page ekaṭa yavana
    return <Navigate to="/admin/login" replace />;
  }

  // Login vī ætnam, illapu piṭuva (children) pennanava
  return children;
};

// Vædagath: Default export eka dænna
export default ProtectedAdminRoute;