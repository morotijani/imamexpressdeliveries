import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  rider?: { name: string } | null;
}

// Mock data for the revenue chart
const revenueData = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 600 },
  { name: 'Thu', revenue: 800 },
  { name: 'Fri', revenue: 500 },
  { name: 'Sat', revenue: 900 },
  { name: 'Sun', revenue: 1200 },
];

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
        setOrders(ordersRes.data.orders.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loader"></div></div>;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Logistics Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time monitoring and analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>calendar_month</span>
            Last 7 Days
          </button>
          <button style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>download</span>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="admin-glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(160, 32, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(160, 32, 240, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '2rem' }}>account_balance_wallet</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Total Revenue</p>
            <h3 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800 }}>GH₵{metrics?.totalRevenue.toFixed(2)}</h3>
            <p style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>trending_up</span> +14.5% from last week
            </p>
          </div>
        </div>

        <div className="admin-glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '2rem' }}>inventory_2</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Completed Deliveries</p>
            <h3 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800 }}>{metrics?.totalDeliveries}</h3>
            <p style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>trending_up</span> +8.2% from last week
            </p>
          </div>
        </div>

        <div className="admin-glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '2rem' }}>two_wheeler</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Active Fleet</p>
            <h3 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800 }}>{metrics?.activeRiders} Riders</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span> 100% online
            </p>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Chart & Map Concept */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Revenue Chart */}
          <div className="admin-glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>show_chart</span>
              Revenue Trend
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `GH₵${value}`} />
                  <Tooltip 
                    contentStyle={{ background: '#1e0e1a', border: '1px solid rgba(160,32,240,0.3)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="admin-glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>receipt_long</span>
                Recent Orders
              </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                <tr>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Order ID</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Receiver</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="data-table-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', color: '#ccc' }}>#{order.id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '1.25rem 2rem', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                          {order.receiverName.charAt(0)}
                        </div>
                        {order.receiverName}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', fontWeight: 600, textAlign: 'right' }}>GH₵{order.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Live Activity Feed & Map Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Live Fleet Widget (Conceptual placeholder for Google Map integration in future) */}
          <div className="admin-glass-card" style={{ padding: 0, overflow: 'hidden', height: '250px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'url(https://maps.googleapis.com/maps/api/staticmap?center=5.6037,-0.1870&zoom=12&size=600x300&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x9e9e9e&style=feature:all|element:labels.text.stroke|color:0xf5f5f5&style=feature:water|element:geometry|color:0x2b1426&key=YOUR_API_KEY) center/cover' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(30, 14, 26, 0.7)' }}></div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#10b981' }}>my_location</span>
                Live Fleet Status
              </h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Active Riders</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{metrics?.activeRiders}</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>In Transit</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{orders.filter(o => o.status === 'PICKED_UP').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="admin-glass-card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>history</span>
              Live Activity
            </h3>
            
            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
              
              {orders.slice(0, 4).map((order, index) => (
                <div key={order.id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '-1.5rem', 
                    top: '4px', 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    background: order.status === 'DELIVERED' ? '#10b981' : order.status === 'ASSIGNED' ? 'var(--primary)' : '#f59e0b',
                    border: '3px solid var(--bg-dark)',
                    zIndex: 2
                  }}></div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                      {order.status === 'DELIVERED' ? (
                        <>Order <strong>#{order.id.slice(-6).toUpperCase()}</strong> was delivered successfully.</>
                      ) : order.status === 'ASSIGNED' ? (
                        <><strong>{order.rider?.name || 'A rider'}</strong> was assigned to order <strong>#{order.id.slice(-6).toUpperCase()}</strong>.</>
                      ) : (
                        <>New order <strong>#{order.id.slice(-6).toUpperCase()}</strong> created by {order.receiverName}.</>
                      )}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} today
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', marginTop: '1rem', transition: 'all 0.2s' }} className="nav-item-hover">
              View Full History
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
