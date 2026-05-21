import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from 'recharts';

interface Order {
  id: string;
  status: string;
  price: number;
  dropoffLocation: string;
  createdAt: string;
  rider: { name: string } | null;
}

const COLORS = {
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
  PENDING: '#f59e0b',
  IN_TRANSIT: 'var(--primary)'
};

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [zonesPage, setZonesPage] = useState(1);
  const zonesPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Failed to fetch orders for analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loader"></div></div>;

  // 1. Process Status Data (Pie Chart)
  const statusCounts = orders.reduce((acc: any, order) => {
    const status = (order.status === 'ASSIGNED' || order.status === 'PICKED_UP') ? 'IN_TRANSIT' : order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key],
    color: COLORS[key as keyof typeof COLORS] || '#ccc'
  }));

  // 2. Process Rider Performance (Bar Chart)
  const riderCounts = orders
    .filter(o => o.status === 'DELIVERED' && o.rider)
    .reduce((acc: any, order) => {
      const name = order.rider!.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

  const riderData = Object.keys(riderCounts)
    .map(name => ({ name, deliveries: riderCounts[name] }))
    .sort((a, b) => b.deliveries - a.deliveries)
    .slice(0, 5); // Top 5

  // 3. Process Revenue Over Time (Area Chart)
  const revenueByDate = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((acc: any, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + order.price;
      return acc;
    }, {});

  const revenueData = Object.keys(revenueByDate)
    .map(date => ({ date, revenue: revenueByDate[date] }))
    .slice(-14); // Last 14 days

  // 4. Process Top Locations
  const locationCounts = orders.reduce((acc: any, order) => {
    const loc = order.dropoffLocation.split(',')[0].trim(); // Get main area name
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const topLocations = Object.keys(locationCounts)
    .map(loc => ({ name: loc, count: locationCounts[loc] }))
    .sort((a, b) => b.count - a.count);

  const paginatedZones = topLocations.slice((zonesPage - 1) * zonesPerPage, zonesPage * zonesPerPage);
  const totalZonesPages = Math.ceil(topLocations.length / zonesPerPage);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deep insights into fleet performance and business growth</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        
        {/* Success Rate */}
        <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Order Success Rate</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '50%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {statusData.map(stat => (
                <div key={stat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', flexShrink: 0, borderRadius: '50%', background: stat.color }}></div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.name.replace('_', ' ')}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Riders */}
        <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Top Riders Leaderboard</h3>
          <div style={{ height: '250px', width: '100%' }}>
            {riderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riderData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--bg-darker)' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }} />
                  <Bar dataKey="deliveries" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20}>
                    {riderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : 'var(--primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No completed deliveries yet</div>
            )}
          </div>
        </div>

        {/* Historical Revenue */}
        <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Historical Revenue</h3>
          <div style={{ height: '250px', width: '100%' }}>
            {revenueData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `GH₵${value}`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No revenue data yet</div>
            )}
          </div>
        </div>

        {/* Popular Zones */}
        <div className="admin-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Hottest Delivery Zones</h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paginatedZones.length > 0 ? paginatedZones.map((loc, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-darker)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ width: '30px', height: '30px', flexShrink: 0, borderRadius: '8px', background: ((zonesPage - 1) * zonesPerPage + index) === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(160, 32, 240, 0.1)', color: ((zonesPage - 1) * zonesPerPage + index) === 0 ? '#10b981' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {((zonesPage - 1) * zonesPerPage + index) + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1rem' }}>{loc.name}</h4>
                  <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', marginTop: '6px' }}>
                    <div style={{ width: `${(loc.count / topLocations[0].count) * 100}%`, height: '100%', background: ((zonesPage - 1) * zonesPerPage + index) === 0 ? '#10b981' : 'var(--primary)', borderRadius: '2px' }}></div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                  {loc.count} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>drops</span>
                </div>
              </div>
            )) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No location data yet</div>
            )}
          </div>
          
          {totalZonesPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button 
                disabled={zonesPage === 1}
                onClick={() => setZonesPage(prev => Math.max(prev - 1, 1))}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem' }}
              >
                Prev
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>{zonesPage} / {totalZonesPages}</span>
              <button 
                disabled={zonesPage === totalZonesPages}
                onClick={() => setZonesPage(prev => prev + 1)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Analytics;
