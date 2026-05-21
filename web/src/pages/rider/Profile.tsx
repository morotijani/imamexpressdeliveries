import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileRider: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Rider Profile</h2>

      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff', 
          fontWeight: 800, 
          fontSize: '2.5rem',
          margin: '0 auto 1rem auto'
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{user?.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Active Rider</p>
      </div>

      <div style={{ background: 'var(--bg-surface)', borderRadius: '1.5rem', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary-light)' }}>email</span>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem', textTransform: 'uppercase' }}>Email Address</p>
            <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user?.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary-light)' }}>phone</span>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem', textTransform: 'uppercase' }}>Phone Number</p>
            <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user?.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          cursor: 'pointer'
        }}
      >
        <span className="material-symbols-outlined">logout</span>
        Sign Out
      </button>
    </div>
  );
};

export default ProfileRider;
