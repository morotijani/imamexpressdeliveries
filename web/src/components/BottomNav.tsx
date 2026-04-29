import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', icon: 'home', path: '/customer' },
    { label: 'History', icon: 'receipt_long', path: '/customer/history' },
    { label: 'Order', icon: 'add_circle', path: '/customer', isPrimary: true },
    { label: 'Profile', icon: 'person', path: '/customer/profile' },
  ];

  return (
    <div className="bottom-nav-container">
      <div className="bottom-nav">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={index}
              className={`bottom-nav-item ${isActive ? 'active' : ''} ${item.isPrimary ? 'primary-item' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="material-symbols-outlined nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
        
        <button className="bottom-nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <span className="material-symbols-outlined nav-icon">logout</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
