import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-darker)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '280px' : '80px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
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
          borderBottom: '1px solid var(--border-color)'
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={logo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Imam<span style={{ color: 'var(--primary)' }}>Express</span></span>
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
          <NavItem to="/admin/analytics" icon="analytics" label="Analytics" open={sidebarOpen} />

          <div style={{ borderTop: '1px solid rgba(138, 43, 226, 0.247)', margin: '0.5rem 1rem' }}></div>
          <NavItem to="/admin/settings" icon="settings" label="Settings" open={sidebarOpen} />
          <NavItem to="/admin/help" icon="help" label="Help & Docs" open={sidebarOpen} />
        </nav>

        {/* User Area */}
        <div
          onClick={() => navigate('/admin/profile')}
          style={{
            padding: '1.5rem',
            borderTop: '1px solid rgba(138, 43, 226, 0.247)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
            cursor: 'pointer'
          }}
          className="nav-item-hover"
        >
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: user?.profileImage ? `url(${user.profileImage.startsWith('data:') || user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`}) center/cover` : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#fff',
                fontSize: '0.8rem'
              }}>
                {!user?.profileImage && (user?.name?.charAt(0) || 'A')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'Administrator'}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin Role</span>
              </div>
            </div>
          ) : (
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: user?.profileImage ? `url(${user.profileImage.startsWith('data:') || user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`}) center/cover` : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'var(--text-main)',
              fontSize: '0.8rem'
            }}>
              {!user?.profileImage && (user?.name?.charAt(0) || 'A')}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{
          height: '70px',
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
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
                value={searchQuery}
                onChange={(e) => setSearchParams({ q: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '2rem',
                  padding: '0.5rem 1rem 0.5rem 2.5rem',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button className="theme-toggle" onClick={toggleTheme} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
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
