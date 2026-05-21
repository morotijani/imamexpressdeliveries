import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalEarnings: number;
  totalCompleted: number;
  todaysEarnings: number;
  todaysCompleted: number;
  activeDelivery: any | null;
  recentCompleted: any[];
}

const DashboardRider: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rider/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="text-center" style={{ paddingTop: '5rem' }}>Loading Dashboard...</div>;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ready for your next delivery?</p>
      </div>

      {/* Hero: Active Delivery */}
      {stats?.activeDelivery ? (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(160, 32, 240, 0.15) 0%, rgba(160, 32, 240, 0.05) 100%)',
          border: '1px solid rgba(160, 32, 240, 0.3)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.05 }}>📦</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Active Route
            </span>
            <span className={`badge badge-${stats.activeDelivery.status.toLowerCase()}`}>{stats.activeDelivery.status}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#eab308', fontSize: '1.2rem', marginTop: '0.1rem' }}>trip_origin</span>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>PICKUP</p>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{stats.activeDelivery.pickupLocation}</p>
              </div>
            </div>
            
            <div style={{ borderLeft: '2px dashed rgba(255,255,255,0.1)', height: '15px', marginLeft: '9px' }}></div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '1.2rem', marginTop: '0.1rem' }}>location_on</span>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>DROP-OFF</p>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{stats.activeDelivery.dropoffLocation}</p>
              </div>
            </div>
          </div>

          <Link to="/rider/deliveries" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', width: '100%', borderRadius: '1rem', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
            View Details & Update
          </Link>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border-color)',
          borderRadius: '1.5rem',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>coffee</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Active Deliveries</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You're all caught up. Wait for the dispatch team to assign a new order.</p>
        </div>
      )}

      {/* Metrics Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Today's Performance</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '1rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#22c55e', marginBottom: '0.5rem' }}>payments</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Earnings</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>GH₵{stats?.todaysEarnings.toFixed(2)}</p>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '1rem' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary-light)', marginBottom: '0.5rem' }}>check_circle</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Completed</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.todaysCompleted}</p>
        </div>
      </div>

    </div>
  );
};

export default DashboardRider;
