import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-darker)', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '280px' : '80px',
        background: '#130c11', // Very dark slate/purple
        borderRight: '1px solid rgba(255,255,255,0.05)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        {/* Logo Area */}
        <div style={{ 
          height: '70px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: sidebarOpen ? '0 1.5rem' : '0', 
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>local_shipping</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.5px' }}>Imam<span style={{ color: 'var(--primary)' }}>Express</span></span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            <span className="material-symbols-outlined">{sidebarOpen ? 'menu_open' : 'menu'}</span>
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem to="/admin" icon="dashboard" label="Dashboard" open={sidebarOpen} end />
          <NavItem to="/admin/orders" icon="view_list" label="Order Management" open={sidebarOpen} />
          <NavItem to="/admin/fleet" icon="explore" label="Fleet Monitoring" open={sidebarOpen} />
          <NavItem to="/admin/riders" icon="sports_motorsports" label="Riders Management" open={sidebarOpen} />
          <NavItem to="/admin/customers" icon="group" label="Customers" open={sidebarOpen} />
          {/* Conceptual Links for future features */}
          <NavItem to="/admin/analytics" icon="analytics" label="Analytics" open={sidebarOpen} />
          <NavItem to="/admin/settings" icon="settings" label="Settings" open={sidebarOpen} />
        </nav>

        {/* User Area */}
        <div style={{ 
          padding: '1.5rem', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center'
        }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'Administrator'}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin Role</span>
              </div>
            </div>
          ) : (
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ 
          height: '70px', 
          background: 'rgba(26, 21, 37, 0.8)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '300px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '1.2rem' }}>search</span>
              <input 
                type="text" 
                placeholder="Search orders, riders..." 
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '2rem',
                  padding: '0.5rem 1rem 0.5rem 2.5rem',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative', display: 'flex' }}>
              <span className="material-symbols-outlined">notifications</span>
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></span>
            </button>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>logout</span>
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} className="custom-scrollbar">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
};

// NavItem Component
const NavItem = ({ to, icon, label, open, end = false }: { to: string, icon: string, label: string, open: boolean, end?: boolean }) => (
  <NavLink 
    to={to} 
    end={end}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: open ? '0.75rem 1.5rem' : '0.75rem 0',
      justifyContent: open ? 'flex-start' : 'center',
      color: isActive ? '#fff' : 'var(--text-muted)',
      background: isActive ? 'linear-gradient(90deg, rgba(160, 32, 240, 0.15) 0%, transparent 100%)' : 'transparent',
      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
      textDecoration: 'none',
      fontWeight: isActive ? 600 : 500,
      transition: 'all 0.2s ease',
      position: 'relative'
    })}
    className="nav-item-hover"
  >
    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'inherit' }}>{icon}</span>
    {open && <span style={{ fontSize: '0.9rem' }}>{label}</span>}
  </NavLink>
);

export default AdminLayout;
