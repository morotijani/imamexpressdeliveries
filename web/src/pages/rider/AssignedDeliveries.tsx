import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Order {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  receiverName: string;
  receiverContact: string;
  status: string;
  price: number;
}

const AssignedDeliveries: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rider/my-deliveries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assigned deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/rider/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="container text-center" style={{ paddingTop: '5rem' }}>Loading Deliveries...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>My Assigned Deliveries</h2>
      
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <h3 className="text-muted">No assigned deliveries right now.</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>You will see new orders here when an admin assigns them to you.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>GH₵{order.price.toFixed(2)}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pickup</p>
                  <p style={{ fontWeight: 500 }}>{order.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drop-off</p>
                  <p style={{ fontWeight: 500 }}>{order.dropoffLocation}</p>
                </div>
              </div>

              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receiver</p>
                <p>{order.receiverName} - <a href={`tel:${order.receiverContact}`} style={{ color: 'var(--primary-light)' }}>{order.receiverContact}</a></p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {order.status === 'ASSIGNED' && (
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => handleStatusUpdate(order.id, 'PICKED_UP')}
                  >
                    Mark as Picked Up
                  </button>
                )}
                {order.status === 'PICKED_UP' && (
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, background: 'linear-gradient(135deg, var(--secondary), var(--secondary-hover))', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}
                    onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                  >
                    Mark as Delivered
                  </button>
                )}
                {order.status === 'DELIVERED' && (
                  <button className="btn btn-secondary" style={{ flex: 1, cursor: 'default' }} disabled>
                    Delivery Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedDeliveries;
