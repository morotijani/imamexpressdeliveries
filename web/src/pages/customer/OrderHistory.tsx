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
  createdAt: string;
}

const OrderHistory: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) return <div className="container text-center" style={{ paddingTop: '5rem' }}>Loading History...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem', fontSize: '2rem' }}>My Delivery History</h2>
      
      {orders.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <h3 className="text-muted">You have no delivery requests yet.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>GH₵{order.price.toFixed(2)}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>From</p>
                  <p style={{ fontWeight: 500 }}>{order.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>To</p>
                  <p style={{ fontWeight: 500 }}>{order.dropoffLocation}</p>
                </div>
              </div>

              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Receiver</p>
                <p>{order.receiverName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
