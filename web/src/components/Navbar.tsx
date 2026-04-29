import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Imam Express
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated && user ? (
            <>
              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin">Dashboard</Link>
                  <Link to="/admin/orders">Manage Orders</Link>
                </>
              )}
              {user.role === 'RIDER' && <Link to="/rider">My Deliveries</Link>}
              {user.role === 'CUSTOMER' && (
                <>
                  <Link to="/customer">Create Order</Link>
                  <Link to="/customer/history">Order History</Link>
                </>
              )}
              
              <div className="flex items-center gap-4 ml-4">
                <span className="text-muted">Hello, {user.name}</span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
