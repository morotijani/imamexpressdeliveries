import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Order {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  receiverName: string;
  status: string;
  price: number;
  rider: { name: string } | null;
}

interface Rider {
  id: string;
  name: string;
}

const OrderManagement: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/riders', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setOrders(ordersRes.data.orders);
      setRiders(ridersRes.data.riders);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    if (!riderId) return;
    try {
      await axios.post('http://localhost:5000/api/admin/orders/assign', 
        { orderId, riderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(); // Refresh list
    } catch (err) {
      alert('Failed to assign rider');
    }
  };

  if (loading) return <div className="container text-center" style={{ paddingTop: '5rem' }}>Loading Orders...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Order Management</h2>
      
      <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Locations</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Rider Assignment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>...{order.id.slice(-6)}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--accent)' }}>From:</span> {order.pickupLocation}<br/>
                    <span style={{ color: 'var(--secondary)' }}>To:</span> {order.dropoffLocation}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {order.status === 'PENDING' ? (
                    <select 
                      className="input-field" 
                      style={{ padding: '0.5rem', width: 'auto' }}
                      defaultValue=""
                      onChange={(e) => handleAssignRider(order.id, e.target.value)}
                    >
                      <option value="" disabled style={{ color: 'black' }}>Assign Rider</option>
                      {riders.map(r => <option key={r.id} value={r.id} style={{ color: 'black' }}>{r.name}</option>)}
                    </select>
                  ) : (
                    <span style={{ color: 'var(--primary-light)' }}>{order.rider?.name || 'Assigned'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
