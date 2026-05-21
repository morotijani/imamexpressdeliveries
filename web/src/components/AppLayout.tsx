import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import BottomNav from './BottomNav';
import logo from '../assets/logo.png';

interface AppLayoutProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
  overlayMode?: boolean;
  mobileLayout?: 'split' | 'full-left' | 'full-right';
}

const AppLayout: React.FC<AppLayoutProps> = ({
  leftContent,
  rightContent,
  overlayMode = false,
  mobileLayout = 'split'
}) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthPage = ['/login', '/register', '/register-success', '/verify-email', '/resend-verification'].includes(location.pathname);

  return (
    <div className="app-shell-wrapper">
      {/* Top Navigation Bar - Solid Variant */}
      <header className="top-header">
        <div className="top-header-left" onClick={() => {
          if (isAuthenticated && user) {
            if (user.role === 'CUSTOMER') navigate('/customer');
            else if (user.role === 'ADMIN') navigate('/admin');
            else if (user.role === 'RIDER') navigate('/rider');
            else navigate('/');
          } else {
            navigate('/');
          }
        }} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
          {/* <h1 className="top-logo-text">
            Imam Express
          </h1> */}
        </div>

        <div className="top-header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated && user?.role === 'CUSTOMER' ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className="theme-toggle"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #eee',
                  color: '#0a0612',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--danger)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                    border: '2px solid #fff'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Floating Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '360px',
                  maxHeight: '450px',
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '1.25rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid #f5f5f5',
                    background: '#fafafa'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0a0612' }}>Notifications</h3>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {notifications.length > 0 && (
                        <span
                          onClick={markAllAsRead}
                          style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Read All
                        </span>
                      )}
                      {notifications.length > 0 && (
                        <span
                          onClick={clearNotifications}
                          style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Clear
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Scrollable List */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                  }} className="custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#cbd5e1' }}>notifications_off</span>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>All caught up! 🎉</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Order status updates will appear here.</p>
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            markAsRead(item.id);
                            setShowNotifications(false);
                            navigate('/customer/history');
                          }}
                          style={{
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid #f8fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0.875rem',
                            background: item.read ? 'transparent' : 'rgba(160, 32, 240, 0.03)',
                            transition: 'background 0.2s ease',
                            alignItems: 'flex-start',
                            textAlign: 'left'
                          }}
                          className="notification-hover"
                        >
                          <div style={{
                            background: item.status === 'ASSIGNED' ? 'rgba(160, 32, 240, 0.1)' :
                              item.status === 'PICKED_UP' ? 'rgba(59, 130, 246, 0.1)' :
                                item.status === 'DELIVERED' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: item.status === 'ASSIGNED' ? 'var(--primary)' :
                              item.status === 'PICKED_UP' ? '#3b82f6' :
                                item.status === 'DELIVERED' ? '#22c55e' : '#ef4444',
                            padding: '0.5rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            flexShrink: 0
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                              {item.status === 'ASSIGNED' ? 'pedal_bike' :
                                item.status === 'PICKED_UP' ? 'inventory_2' :
                                  item.status === 'DELIVERED' ? 'check_circle' : 'cancel'}
                            </span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: item.read ? 600 : 700, color: '#0a0612', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#94a3b8', flexShrink: 0 }}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </h4>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                              {item.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="theme-toggle" style={{ background: '#ffffff', border: '1px solid #eee', color: '#0a0612' }}>
              <span className="material-symbols-outlined">dark_mode</span>
            </button>
          )}

          {isAuthenticated && (
            <div
              className="header-profile-pic"
              onClick={() => navigate('/customer/profile')}
              style={{
                background: user?.profileImage ? `url(${user.profileImage.startsWith('data:') || user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`}) center/cover` : 'var(--primary)',
                border: '2px solid #fff',
                overflow: 'hidden'
              }}
            >
              {!user?.profileImage && (user?.name?.charAt(0).toUpperCase() || 'U')}
            </div>
          )}
        </div>
      </header>

      <div className={`app-shell ${isAuthPage ? 'auth-shell' : ''} ${overlayMode ? 'map-overlay-mode' : ''} mobile-layout-${mobileLayout}`}>
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
        </div>
      </div>

      {/* Render Bottom Nav for Customers at wrapper level to prevent mobile panel hiding */}
      {isAuthenticated && user?.role === 'CUSTOMER' && !overlayMode && (
        <BottomNav />
      )}
    </div>
  );
};

export default AppLayout;
