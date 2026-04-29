import React from 'react';
import AppLayout from '../../components/AppLayout';

const Profile: React.FC = () => {
  const leftContent = (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#fff' }}>Profile</h2>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
        <h3 className="text-muted" style={{ fontSize: '0.875rem' }}>Profile details coming soon.</h3>
      </div>
    </div>
  );

  return <AppLayout leftContent={leftContent} />;
};

export default Profile;
