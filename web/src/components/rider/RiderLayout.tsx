import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

const RiderLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/rider', icon: 'home', exact: true },
    { name: 'Deliveries', path: '/rider/deliveries', icon: 'local_shipping' },
    { name: 'Earnings', path: '/rider/earnings', icon: 'account_balance_wallet' },
    { name: 'Profile', path: '/rider/profile', icon: 'person' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-base)', 
      color: 'var(--text-main)',
      paddingBottom: '80px', // Space for bottom nav
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Top Header - Minimal */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>Rider Portal</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="theme-toggle" onClick={toggleTheme} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '2rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>Online</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '1.5rem 5%', maxWidth: '800px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Navigation - Mobile First */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(15px)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 50,
        padding: '0.5rem 0 1rem 0',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              position: 'relative',
              transition: 'all 0.2s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ 
                  fontSize: '1.5rem',
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      width: '30px',
                      height: '3px',
                      background: 'var(--primary)',
                      borderRadius: '0 0 4px 4px'
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default RiderLayout;
