import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../assets/logo-transparent.png';

const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = auth?.isAuthenticated || false;

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/customer');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="public-nav" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 5%',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="text-gradient">Imam Express</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle Theme"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        {isAuthenticated ? (
          <button 
            onClick={handleCtaClick}
            className="btn btn-primary"
            style={{ borderRadius: '2rem', padding: '0.6rem 1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Go to Dashboard <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
          </button>
        ) : (
          <>
            <span onClick={() => navigate('/login')} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} className="hover-light">Sign In</span>
            <button 
              onClick={() => navigate('/register')}
              className="btn btn-primary"
              style={{ borderRadius: '2rem', padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}
            >
              Register Now
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
