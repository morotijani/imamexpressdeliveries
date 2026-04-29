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
      <div className="app-shell">
        <div className="app-sidebar">
          {/* Logo Header replacing Navbar */}
          <div style={{ padding: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'cursive', color: '#fff', margin: 0 }}>
              Imam Express
            </h1>
          </div>
          
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
