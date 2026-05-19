import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#16161c',
      color: '#fff', 
      fontFamily: "'Outfit', sans-serif", 
      position: 'relative'
    }}>
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
