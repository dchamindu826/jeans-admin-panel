// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Admin Panel Pages
import AdminLayout from './admin_panel/components/AdminLayout';
import AdminLogin from './admin_panel/pages/AdminLogin';
import AdminDashboard from './admin_panel/pages/AdminDashboard';
import AdminCustomers from './admin_panel/pages/AdminCustomers';
import CustomerInvoices from './admin_panel/pages/CustomerInvoices';
import AdminSettings from './admin_panel/pages/AdminSettings';

// Overview Page
import OverviewDashboard from './overview/pages/OverviewDashboard';

// Auth Component
import ProtectedAdminRoute from './components/Auth/ProtectedAdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- CEO Overview Page --- */}
        <Route path="/" element={<OverviewDashboard />} />
        
        {/* --- Admin Panel Routes --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Mē siyalla Admin Layout eka tuḷa penvanna */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          {/* Default admin page eka Dashboard eka */}
          <Route index element={<Navigate to="dashboard" replace />} /> 
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="invoices/:customerId" element={<CustomerInvoices />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;