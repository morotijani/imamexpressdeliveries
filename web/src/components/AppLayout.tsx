import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ leftContent, rightContent }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/register', '/register-success', '/verify-email', '/resend-verification'].includes(location.pathname);

  return (
    <div className="app-shell-wrapper">
      {/* Top Navigation Bar - Solid Variant */}
      <header className="top-header">
        <div className="top-header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(160, 32, 240, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>local_shipping</span>
          </div>
          <h1 className="top-logo-text">
            Imam Express
          </h1>
        </div>
        
        <div className="top-header-right">
          <button className="theme-toggle" style={{ background: '#ffffff', border: '1px solid #eee', color: '#0a0612' }}>
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
          
          {isAuthenticated && (
            <div 
              className="header-profile-pic" 
              onClick={() => navigate('/customer/profile')}
              style={{ 
                background: user?.profileImage ? `url(${user.profileImage}) center/cover` : 'var(--primary)',
                border: '2px solid #fff',
                overflow: 'hidden'
              }}
            >
              {!user?.profileImage && (user?.name?.charAt(0).toUpperCase() || 'U')}
            </div>
          )}
        </div>
      </header>

      <div className={`app-shell ${isAuthPage ? 'auth-shell' : ''}`}>
        <div className="app-sidebar">
          
          <div className="app-sidebar-content">
            {leftContent}
            
            {!isAuthenticated && !isAuthPage && (
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
