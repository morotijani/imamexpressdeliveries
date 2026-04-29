import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Metrics {
  totalDeliveries: number;
  totalRevenue: number;
  activeRiders: number;
}

interface Order {
  id: string;
  receiverName: string;
  status: string;
  price: number;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const metricsRes = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersRes = await axios.get('http://localhost:5000/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMetrics(metricsRes.data);
        setOrders(ordersRes.data.orders.slice(0, 5)); // Show only latest 5 for overview
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <div className="container text-center" style={{ paddingTop: '5rem' }}>Loading Dashboard...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Admin Dashboard</h2>
      
      {/* Metrics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Total Revenue</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--secondary)' }}>GH₵{metrics?.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.1s' }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Completed Deliveries</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-light)' }}>{metrics?.totalDeliveries}</p>
        </div>

        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'center', animationDelay: '0.2s' }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Active Riders</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>{metrics?.activeRiders}</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Recent Orders</h3>
      <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Order ID</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Receiver</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map(order => (
              <tr key={order.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>...{order.id.slice(-6)}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{order.receiverName}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>GH₵{order.price.toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
