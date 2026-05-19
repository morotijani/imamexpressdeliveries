import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated || false;

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/customer');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 5%',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      background: 'rgba(22, 22, 28, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(160, 32, 240, 0.2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>local_shipping</span>
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="text-gradient">Imam Express</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
