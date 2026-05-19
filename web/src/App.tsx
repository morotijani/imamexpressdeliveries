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
import CustomerDashboard from './pages/customer/Dashboard';
import Dashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import OrderManagement from './pages/admin/OrderManagement';
import FleetMonitoring from './pages/admin/FleetMonitoring';
import Customers from './pages/admin/Customers';
import RidersManagement from './pages/admin/RidersManagement';
import Analytics from './pages/admin/Analytics';
import Help from './pages/admin/Help';
import Settings from './pages/admin/Settings';
import AssignedDeliveries from './pages/rider/AssignedDeliveries';
import Profile from './pages/customer/Profile';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/public/AboutUs';
import Careers from './pages/public/Careers';
import PartnerNetwork from './pages/public/PartnerNetwork';
import Contact from './pages/public/Contact';
import TermsOfService from './pages/public/TermsOfService';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import CookiePolicy from './pages/public/CookiePolicy';
import InsuranceInfo from './pages/public/InsuranceInfo';

import TopNavbar from './components/TopNavbar';
import PublicLayout from './components/public/PublicLayout';
import AdminLayout from './components/admin/AdminLayout';
import ScrollToTop from './components/ScrollToTop';

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <TopNavbar />
    <main>
      {children}
    </main>
  </>
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
      <ScrollToTop />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-success" element={<RegisterSuccess />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* Public Static Pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/partners" element={<PartnerNetwork />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/insurance" element={<InsuranceInfo />} />
      </Route>
      
      {/* Customer Routes */}
      <Route path="/customer/*" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <Routes>
            <Route path="" element={<CustomerDashboard />} />
            <Route path="create-order" element={<CreateOrder />} />
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
        <Route path="profile" element={<AdminProfile />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="fleet" element={<FleetMonitoring />} />
        <Route path="customers" element={<Customers />} />
        <Route path="riders" element={<RidersManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="help" element={<Help />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
