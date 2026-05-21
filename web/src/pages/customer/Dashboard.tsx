import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

interface Order {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  receiverName: string;
  receiverContact: string;
  status: string;
  price: number;
  deliveryPin?: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ homeAddress: '', workAddress: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Orders
        const ordersRes = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(ordersRes.data.orders);

        // Fetch Profile for addresses
        const profileRes = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile({
          homeAddress: profileRes.data.user.homeAddress || '',
          workAddress: profileRes.data.user.workAddress || ''
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Derive Stats
  const activeOrders = orders.filter(o => ['PENDING', 'ASSIGNED', 'PICKED_UP'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const leftContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Welcome Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', marginTop: '0.8rem' }}>
        <div style={{
          width: '54px',
          height: '54px',
          background: user?.profileImage ? `url(${user.profileImage.startsWith('data:') || user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`}) center/cover` : 'var(--primary)',
          borderRadius: '50%',
          border: '2px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          color: '#fff',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(160, 32, 240, 0.2)'
        }}>
          {!user?.profileImage && (user?.name?.charAt(0).toUpperCase() || 'U')}
        </div>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Hello, {user?.name || 'Customer'}!</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Where are we delivering today?</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted" style={{ padding: '3rem' }}>Loading Dashboard...</div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingRight: '0.5rem', scrollbarWidth: 'none' }}
        >
          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexShrink: 0 }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(160,32,240,0.15)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>pedal_bike</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</p>
                <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>{activeOrders.length}</h3>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>check_circle</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</p>
                <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>{completedOrders.length}</h3>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '1.5rem', padding: '1.5rem', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(160, 32, 240, 0.25)', flexShrink: 0 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Express Delivery</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 1.25rem 0', maxWidth: '80%' }}>Send documents, packages, or food across town instantly.</p>
              <button 
                onClick={() => navigate('/customer/create-order')}
                className="btn" 
                style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700, borderRadius: '2rem', padding: '0.6rem 1.5rem', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              >
                Send Package Now
              </button>
            </div>
            {/* Background design elements */}
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '10rem', color: 'rgba(255,255,255,0.06)', userSelect: 'none', pointerEvents: 'none' }}>local_shipping</span>
          </motion.div>

          {/* Saved Addresses Section */}
          <motion.div variants={itemVariants} style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>Saved Places</h3>
              <span onClick={() => navigate('/customer/profile')} style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Manage</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div 
                onClick={() => {
                  if (profile.homeAddress) {
                    navigate('/customer/create-order');
                  } else {
                    navigate('/customer/profile');
                  }
                }}
                style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '50%', color: '#fff', display: 'flex' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>home</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>Home Address</h4>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.homeAddress || 'Set your Home address in Profile'}
                  </p>
                </div>
              </div>

              <div 
                onClick={() => {
                  if (profile.workAddress) {
                    navigate('/customer/create-order');
                  } else {
                    navigate('/customer/profile');
                  }
                }}
                style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '50%', color: '#fff', display: 'flex' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>work</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>Work Address</h4>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.workAddress || 'Set your Work address in Profile'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Deliveries */}
          <motion.div variants={itemVariants} style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>Recent Shipments</h3>
              <span onClick={() => navigate('/customer/history')} style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>View All</span>
            </div>
            
            {orders.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent deliveries found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.slice(0, 3).map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => navigate('/customer/history')}
                    style={{ background: 'var(--bg-sidebar)', borderRadius: '1rem', padding: '1rem', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className={`badge badge-${order.status.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>{order.status}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>GH₵{order.price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.pickupLocation}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.dropoffLocation}</p>
                      </div>
                    </div>
                    
                    {['ASSIGNED', 'PICKED_UP'].includes(order.status) && order.deliveryPin && (
                      <div style={{ marginTop: '1rem', background: 'rgba(160, 32, 240, 0.1)', border: '1px dashed rgba(160, 32, 240, 0.3)', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.65rem', color: 'var(--primary-light)', textTransform: 'uppercase' }}>Delivery PIN (Give to Rider)</p>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.2rem', color: 'var(--text-main)' }}>{order.deliveryPin}</h4>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );

  const rightContent = (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '2.5rem', color: 'var(--text-main)', boxSizing: 'border-box', background: 'var(--bg-darker)' }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: 'auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }} className="text-gradient">Imam Express Delivery</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>Fast, reliable, and premium logistics at the tip of your fingers.</p>

        {/* Dashboard Cards Grid for Desktop view */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Main welcome statistics card */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '2rem', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>monitoring</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>Analytics Overview</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>View your full historical spending and delivery records.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2.5rem' }}>
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</span>
                <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0 0 0', fontWeight: 800 }}>GH₵{totalSpent.toFixed(2)}</h2>
              </div>
              <div style={{ borderLeft: '3px solid #4ade80', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders</span>
                <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0 0 0', fontWeight: 800 }}>{orders.length}</h2>
              </div>
            </div>
          </div>

          {/* Quick promotion widget */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '2rem', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#ffb020' }}>workspace_premium</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>Premium Tier</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>You receive <strong>priority courier assignment</strong> on every delivery order request.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Level</span>
              <div style={{ fontWeight: 700, color: '#ffb020', fontSize: '1rem', marginTop: '0.2rem' }}>⭐ Imam Express Gold</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return <AppLayout leftContent={leftContent} rightContent={rightContent} mobileLayout="full-left" />;
};

export default Dashboard;
