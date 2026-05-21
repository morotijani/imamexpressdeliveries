import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EarningsRider: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rider/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load earnings stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="text-center" style={{ paddingTop: '5rem' }}>Loading Earnings...</div>;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Earnings & History</h2>

      <div style={{ 
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Lifetime Earnings</p>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>GH₵{stats?.totalEarnings.toFixed(2)}</h1>
        <p style={{ fontSize: '0.85rem', color: '#22c55e', marginTop: '0.5rem', fontWeight: 600 }}>From {stats?.totalCompleted} deliveries</p>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Deliveries</h3>
      {stats?.recentCompleted && stats.recentCompleted.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {stats.recentCompleted.map((order: any) => (
            <div key={order.id} style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '1rem',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{order.dropoffLocation}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(order.updatedAt).toLocaleDateString()} at {new Date(order.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--primary-light)' }}>
                +GH₵{order.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-center" style={{ padding: '2rem' }}>No completed deliveries yet.</p>
      )}
    </div>
  );
};

export default EarningsRider;
