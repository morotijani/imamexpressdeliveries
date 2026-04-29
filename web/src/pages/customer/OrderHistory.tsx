import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

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

  const leftContent = (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: '0.8rem', color: '#fff' }}>Delivery History</h2>

      {loading ? (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
          <h3 className="text-muted" style={{ fontSize: '0.875rem' }}>You have no delivery requests yet.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>GH₵{order.price.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>From</p>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{order.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>To</p>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{order.dropoffLocation}</p>
                </div>
              </div>

              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Receiver</p>
                <p style={{ fontSize: '0.875rem' }}>{order.receiverName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return <AppLayout leftContent={leftContent} />;
};

export default OrderHistory;
