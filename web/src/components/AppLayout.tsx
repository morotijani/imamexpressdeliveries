import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ leftContent, rightContent }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell-wrapper">
      {/* Top Navigation Bar */}
      <header className="top-header">
        <div className="top-header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.025em' }}>
            Imam Express
          </h1>
        </div>
        
        <div className="top-header-right">
          <button className="theme-toggle">
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
          
          {isAuthenticated && (
            <div className="header-profile-pic" onClick={() => navigate('/customer/profile')}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </header>

      <div className="app-shell">
        <div className="app-sidebar">
          
          <div className="app-sidebar-content">
            {leftContent}
            
            {!isAuthenticated && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', borderRadius: '2rem' }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', borderRadius: '2rem' }}
                  onClick={() => navigate('/register')}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="app-main" style={{ position: 'relative' }}>
          {rightContent || (
            <div className="empty-main-content"></div>
          )}
          
          {/* Render Bottom Nav for Customers - Now inside app-main */}
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <BottomNav />
          )}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
