import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterSuccess from './pages/auth/RegisterSuccess';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResendVerification from './pages/auth/ResendVerification';
import CreateOrder from './pages/customer/CreateOrder';
import OrderHistory from './pages/customer/OrderHistory';
import Dashboard from './pages/admin/Dashboard';
import OrderManagement from './pages/admin/OrderManagement';
import FleetMonitoring from './pages/admin/FleetMonitoring';
import Customers from './pages/admin/Customers';
import RidersManagement from './pages/admin/RidersManagement';
import AssignedDeliveries from './pages/rider/AssignedDeliveries';
import Profile from './pages/customer/Profile';

import AppLayout from './components/AppLayout';
import TopNavbar from './components/TopNavbar';
import AdminLayout from './components/admin/AdminLayout';

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <TopNavbar />
    <main>
      {children}
    </main>
  </>
);

const Home = () => (
  <AppLayout leftContent={
    <div style={{ paddingTop: '5rem', textAlign: 'center' }}>
      <h1 className="text-gradient">Premium Logistics & Delivery</h1>
      <p className="text-muted" style={{ marginTop: '1rem' }}>Fast, secure, and beautiful delivery services.</p>
    </div>
  } />
);

import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="container text-center" style={{ paddingTop: '5rem' }}>Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-success" element={<RegisterSuccess />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
      
      {/* Customer Routes */}
      <Route path="/customer/*" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <Routes>
            <Route path="" element={<CreateOrder />} />
            <Route path="history" element={<OrderHistory />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Rider Routes */}
      <Route path="/rider/*" element={
        <ProtectedRoute allowedRoles={['RIDER']}>
          <DefaultLayout>
            <AssignedDeliveries />
          </DefaultLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="fleet" element={<FleetMonitoring />} />
        <Route path="customers" element={<Customers />} />
        <Route path="riders" element={<RidersManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
