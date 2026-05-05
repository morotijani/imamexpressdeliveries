import React, { useState } from 'react';

const Help: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: 'dashboard' },
    { id: 'orders', label: 'Order Management', icon: 'view_list' },
    { id: 'colors', label: 'UI Color Guide', icon: 'palette' },
    { id: 'fleet', label: 'Fleet & Riders', icon: 'two_wheeler' },
    { id: 'customers', label: 'Customer Accounts', icon: 'group' },
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', paddingBottom: '2rem' }}>
      
      {/* Table of Contents / Sidebar */}
      <div className="admin-glass-card" style={{ width: '280px', flexShrink: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Help Center
        </h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                background: activeTab === item.id ? 'rgba(160, 32, 240, 0.15)' : 'transparent',
                border: 'none',
                borderLeft: activeTab === item.id ? '3px solid var(--primary)' : '3px solid transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-muted)',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontWeight: activeTab === item.id ? 600 : 400
              }}
              className={activeTab !== item.id ? "nav-item-hover" : ""}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: activeTab === item.id ? 'var(--primary)' : 'inherit' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="admin-glass-card custom-scrollbar" style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Admin Documentation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
            Welcome to the Imam Express Deliveries command center. This guide explains how to read and operate your logistics dashboard effectively.
          </p>
        </div>

        {/* Section 1: Overview */}
        <section id="overview" style={{ marginBottom: '4rem', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>dashboard</span>
            Dashboard Overview
          </h2>
          <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            The Dashboard is your primary high-level view of the company's performance. It aggregates real-time data across all branches of operation.
          </p>
          <ul style={{ color: '#ccc', lineHeight: '1.6', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Total Deliveries:</strong> The total number of lifetime orders that have successfully reached the <code>DELIVERED</code> status.</li>
            <li><strong>Total Revenue:</strong> The cumulative monetary value of all successfully delivered orders.</li>
            <li><strong>Active Fleet:</strong> The number of riders currently registered in the system.</li>
            <li><strong>Revenue Trend Chart:</strong> A visual area chart showing income over the last 7 days, helping you identify peak operational days.</li>
          </ul>
        </section>

        {/* Section 2: Order Management */}
        <section id="orders" style={{ marginBottom: '4rem', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>view_list</span>
            Order Management & Statuses
          </h2>
          <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            The Order Management page is where dispatchers spend most of their time. It provides a filtering grid and a powerful right-side details panel.
          </p>
          
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Understanding Order Statuses</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.25rem' }}>PENDING</strong>
              <span style={{ color: '#ccc', fontSize: '0.9rem' }}>A new order has been created by a customer but no rider has been assigned yet. Action required from dispatch.</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>ASSIGNED</strong>
              <span style={{ color: '#ccc', fontSize: '0.9rem' }}>A dispatcher has allocated a rider to the order. The rider should be heading to the pickup location.</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '0.25rem' }}>PICKED_UP</strong>
              <span style={{ color: '#ccc', fontSize: '0.9rem' }}>The rider has collected the package and is currently en route to the dropoff location.</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <strong style={{ color: '#10b981', display: 'block', marginBottom: '0.25rem' }}>DELIVERED</strong>
              <span style={{ color: '#ccc', fontSize: '0.9rem' }}>The package has successfully reached its destination and the transaction is closed.</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              <strong style={{ color: '#ef4444', display: 'block', marginBottom: '0.25rem' }}>CANCELLED</strong>
              <span style={{ color: '#ccc', fontSize: '0.9rem' }}>The order was aborted either by the customer or the admin.</span>
            </div>
          </div>
          
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Dispatch Workflow</h4>
          <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.9rem' }}>
            To dispatch an order, locate a <code>PENDING</code> order in the grid. Click the three vertical dots (Quick Action Menu) on the far right of the row and select "Assign Rider", or simply click anywhere on the row to open the side panel. In the side panel, scroll down to the "Rider Assignment" box, select an available rider from the dropdown, and click "Assign".
          </p>
        </section>

        {/* Section 3: Colors */}
        <section id="colors" style={{ marginBottom: '4rem', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>palette</span>
            UI Color Guide
          </h2>
          <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            The dashboard uses a strict color-coding system to help administrators rapidly identify the state of operations at a glance.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#10b981', flexShrink: 0 }}></div>
              <div>
                <strong style={{ color: '#fff' }}>Emerald Green (#10b981) - "Positive / Active"</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Used for Completed Deliveries, Verified Email Accounts, and Riders that are actively "In Transit".</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary)', flexShrink: 0 }}></div>
              <div>
                <strong style={{ color: '#fff' }}>Neon Purple (Brand Primary) - "Neutral / Idle"</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Used for standard active UI elements, Assigned orders, and Riders that are "Online" but currently waiting for dispatch.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f59e0b', flexShrink: 0 }}></div>
              <div>
                <strong style={{ color: '#fff' }}>Amber Orange (#f59e0b) - "Pending / Warning"</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Used for orders requiring dispatch (Pending) and Customer accounts that have not yet verified their email addresses.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ef4444', flexShrink: 0 }}></div>
              <div>
                <strong style={{ color: '#fff' }}>Crimson Red (#ef4444) - "Negative / Critical"</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Used for Cancelled orders, Suspended accounts, and destructive actions (like deleting records).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Fleet & Riders */}
        <section id="fleet" style={{ marginBottom: '4rem', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>two_wheeler</span>
            Fleet Monitoring & Riders
          </h2>
          <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Personnel management is split across two main views to separate geographical logistics from human resources.
          </p>
          
          <div style={{ background: 'rgba(160, 32, 240, 0.05)', border: '1px solid rgba(160, 32, 240, 0.2)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>1. Fleet Monitoring (Live Map)</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
              This is the Live Command Center. It features a full-screen interactive Google Map. The system automatically reads the database to determine which riders are currently working an order. 
              Riders marked with a Green Dot are currently navigating an order. Riders marked with a Purple Dot are online but idle. Clicking any dot (or name in the sidebar) opens their live status.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>2. Riders Management (HR Portal)</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
              This page displays your fleet in a structured data grid. Here you can view when a rider was onboarded, their contact info, and their active status. 
              <strong>To onboard a new rider</strong>, click the "Onboard Rider" button at the top right. Fill out their details and a temporary password. The system will automatically create their account and send them a secure verification email.
            </p>
          </div>
        </section>

        {/* Section 5: Customers */}
        <section id="customers" style={{ marginBottom: '4rem', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>group</span>
            Customer Accounts
          </h2>
          <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            The Customers page provides oversight on the end-users interacting with the consumer-facing app.
          </p>
          <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.9rem' }}>
            Like the Order grid, the Customer grid features a Quick Action Menu (three vertical dots) on the far right of each row. Opening a customer profile reveals their Email Verification status. Customers with a <code>Pending</code> status cannot log in to place orders until they click the link in their registration email. If a customer loses their email, they can request a new one via the public login page.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Help;
