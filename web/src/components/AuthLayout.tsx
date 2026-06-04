import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-transparent.png';
import { useTheme } from '../context/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
  locationName?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, locationName }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'var(--bg-base)', // Adapts to light/dark
      padding: '2rem'
    }}>
      <style>
        {`
          .auth-card-container {
            flex-direction: row;
          }
          @media (max-width: 768px) {
            .auth-card-container {
              flex-direction: column !important;
              gap: 2rem !important;
              padding: 2rem 1.5rem !important;
            }
          }
          
          .google-input-group {
            position: relative;
            margin-bottom: 1.5rem;
            width: 100%;
          }
          
          .google-input {
            width: 100%;
            padding: 1rem 1rem;
            background: transparent;
            border: 1px solid var(--border-color-hover);
            border-radius: 0.5rem;
            color: var(--text-main);
            font-size: 1rem;
            outline: none;
            transition: all 0.2s ease;
          }
          
          .google-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 1px var(--primary);
          }
          
          .google-input-label {
            position: absolute;
            left: 1rem;
            top: 1rem;
            color: var(--text-muted);
            pointer-events: none;
            transition: 0.2s ease all;
            background: var(--bg-surface);
            padding: 0 0.25rem;
            line-height: 1;
          }
          
          .google-input:focus ~ .google-input-label,
          .google-input:not(:placeholder-shown) ~ .google-input-label,
          .google-input-group.has-value .google-input-label,
          .google-input-group:focus-within .google-input-label {
            top: -0.5rem;
            font-size: 0.75rem;
            color: var(--primary);
            font-weight: 500;
          }
        `}
      </style>

      {/* Top Navbar / Logo (Optional, outside the card) */}
      <div
        style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img src={logo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>Imam Express</span>
      </div>

      {/* Theme Toggle (Top Right) */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '1.5rem',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '1040px',
        display: 'flex',
        gap: '4rem',
      }} className="auth-card-container">
        {children}
      </div>

      {/* Footer / Location Status */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1040px', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
          <span>English (Ghana)</span>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_drop_down</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {locationName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>location_on</span>
              <span>Live from {locationName}</span>
              <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981', marginLeft: '0.25rem' }}></div>
            </div>
          )}
          <a href="/#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
          <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
