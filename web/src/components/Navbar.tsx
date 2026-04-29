import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'cursive', color: '#fff', textDecoration: 'none' }}>
          Imam Express
        </Link>
        {isAuthenticated && (
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            Logout
          </button>
        )}
      </div>

      {isAuthenticated && user && (
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin" className="nav-link">Dashboard</Link>
              <Link to="/admin/orders" className="nav-link">Manage Orders</Link>
            </>
          )}
          {user.role === 'RIDER' && <Link to="/rider" className="nav-link">My Deliveries</Link>}
          {user.role === 'CUSTOMER' && (
            <>
              <Link to="/customer" className="nav-link">Create Gift</Link>
              <Link to="/customer/history" className="nav-link">History</Link>
            </>
          )}
        </nav>
      )}
      {!isAuthenticated && (
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </nav>
      )}
    </div>
  );
};

export default Navbar;
