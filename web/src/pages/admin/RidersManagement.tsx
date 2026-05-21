import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  status: string;
  rider: { id: string } | null;
}

const QuickActionMenu = ({ rider, onView }: { rider: Rider, onView: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="nav-item-hover"
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setOpen(false); }}></div>
          <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.5rem', zIndex: 100, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpen(false); onView(); }}
              style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '0.5rem', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '0.25rem', fontSize: '0.85rem' }}
              className="nav-item-hover"
            >
              View Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const RidersManagement: React.FC = () => {
  const { token } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Panels
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardData, setOnboardData] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [ridersRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/riders', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRiders(ridersRes.data.riders);
      setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        ...onboardData,
        role: 'RIDER'
      });
      toast.success('Rider onboarded successfully! A verification email has been sent to them.');
      setShowOnboardModal(false);
      setOnboardData({ name: '', email: '', phone: '', password: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to onboard rider');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loader"></div></div>;

  // Calculate active riders (those who have an order with status ASSIGNED or PICKED_UP)
  const activeRidersCount = new Set(
    orders
      .filter(o => (o.status === 'ASSIGNED' || o.status === 'PICKED_UP') && o.rider)
      .map(o => o.rider!.id)
  ).size;

  return (
    <div style={{ paddingBottom: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Riders Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Human resources oversight for logistics personnel</p>
        </div>
        <button 
          onClick={() => setShowOnboardModal(true)}
          className="btn btn-primary" 
          style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>person_add</span>
          Onboard Rider
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(160, 32, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(160, 32, 240, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '2rem' }}>two_wheeler</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Total Fleet Size</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>{riders.length}</h3>
          </div>
        </div>

        <div className="admin-glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '2rem' }}>check_circle</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Active Riders</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>{activeRidersCount}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Main Data Grid */}
        <div className="admin-glass-card" style={{ flex: selectedRider ? 2 : 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'flex 0.3s ease' }}>
          <div style={{ overflowY: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Rider Personnel</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Onboarded On</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(rider => {
                  const isActive = orders.some(o => (o.status === 'ASSIGNED' || o.status === 'PICKED_UP') && o.rider?.id === rider.id);
                  return (
                    <tr 
                      key={rider.id} 
                      onClick={() => setSelectedRider(rider)}
                      className="data-table-row" 
                      style={{ 
                        borderTop: '1px solid var(--border-color)',
                        background: selectedRider?.id === rider.id ? 'rgba(160, 32, 240, 0.1)' : 'transparent',
                        borderLeft: selectedRider?.id === rider.id ? '3px solid var(--primary)' : '3px solid transparent'
                      }}
                    >
                      <td style={{ padding: '1.25rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ position: 'relative' }}>
                            <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                              {rider.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: isActive ? '#10b981' : '#6b7280', border: '2px solid var(--bg-darker)' }}></div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rider.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {rider.id.split('-')[0]}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{rider.email}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rider.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {new Date(rider.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <QuickActionMenu 
                            rider={rider} 
                            onView={() => setSelectedRider(rider)} 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {riders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No riders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {Math.ceil(riders.length / itemsPerPage) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-sidebar)' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>Page {currentPage} of {Math.ceil(riders.length / itemsPerPage)}</span>
              <button 
                disabled={currentPage * itemsPerPage >= riders.length}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.85rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Details Side Panel */}
        {selectedRider && (
          <div className="admin-glass-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', animation: 'fade-in-right 0.3s ease', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Rider Profile</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>#{selectedRider.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRider(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="custom-scrollbar">
              <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>
                {selectedRider.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }}>{selectedRider.name}</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>{selectedRider.email}</p>

              <div style={{ width: '100%', background: 'var(--bg-darker)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Contact Info</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{selectedRider.phone || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                  <span style={{ fontSize: '0.85rem', color: orders.some(o => (o.status === 'ASSIGNED' || o.status === 'PICKED_UP') && o.rider?.id === selectedRider.id) ? '#10b981' : 'var(--text-muted)' }}>
                    {orders.some(o => (o.status === 'ASSIGNED' || o.status === 'PICKED_UP') && o.rider?.id === selectedRider.id) ? 'In Transit' : 'Available'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Onboarded</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{new Date(selectedRider.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div style={{ width: '100%', marginTop: '2rem' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Performance Metrics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(160, 32, 240, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(160, 32, 240, 0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deliveries</p>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {orders.filter(o => o.rider?.id === selectedRider.id).length}
                    </p>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Success Rate</p>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                      {(() => {
                        const riderOrders = orders.filter(o => o.rider?.id === selectedRider.id);
                        if (riderOrders.length === 0) return '0%';
                        const completed = riderOrders.filter(o => o.status === 'DELIVERED').length;
                        return `${Math.round((completed / riderOrders.length) * 100)}%`;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Performance Chart */}
                <div style={{ height: '180px', width: '100%', marginBottom: '2rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Pending', count: orders.filter(o => o.rider?.id === selectedRider.id && o.status === 'ASSIGNED').length },
                      { name: 'In Transit', count: orders.filter(o => o.rider?.id === selectedRider.id && o.status === 'PICKED_UP').length },
                      { name: 'Delivered', count: orders.filter(o => o.rider?.id === selectedRider.id && o.status === 'DELIVERED').length }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ width: '100%' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Recent Activity</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {orders.filter(o => o.rider?.id === selectedRider.id).slice(0, 5).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Order #{o.id.slice(-6).toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: {o.status}</p>
                      </div>
                      <span className={`badge badge-${o.status.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>{o.status}</span>
                    </div>
                  ))}
                  {orders.filter(o => o.rider?.id === selectedRider.id).length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No activity recorded yet.</p>
                  )}
                </div>
              </div>

              <div style={{ width: '100%', marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                 <button style={{ flex: 1, padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} className="nav-item-hover">
                   <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>message</span> Message
                 </button>
                 <button style={{ flex: 1, padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} className="nav-item-hover">
                   <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>block</span> Suspend
                 </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Onboard Modal */}
      {showOnboardModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', animation: 'fade-in 0.3s ease', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Onboard Rider</h2>
              <button onClick={() => setShowOnboardModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleOnboardSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" required className="input-field" value={onboardData.name} onChange={e => setOnboardData({...onboardData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" required className="input-field" value={onboardData.email} onChange={e => setOnboardData({...onboardData, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="tel" required className="input-field" value={onboardData.phone} onChange={e => setOnboardData({...onboardData, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Temporary Password</label>
                <input type="password" required className="input-field" value={onboardData.password} onChange={e => setOnboardData({...onboardData, password: e.target.value})} />
              </div>
              
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {submitting ? 'Creating Profile...' : 'Create Rider Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RidersManagement;
