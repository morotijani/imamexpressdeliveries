import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

const QuickActionMenu = ({ customer, onView }: { customer: Customer, onView: () => void }) => {
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
          <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.5rem', zIndex: 100, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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

interface Order {
  id: string;
  status: string;
  price: number;
  customer: { id: string } | null;
  createdAt: string;
}

const Customers: React.FC = () => {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleToggleSuspend = async (id: string) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/customers/${id}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(customers.map(c => c.id === id ? { ...c, isSuspended: res.data.customer.isSuspended } : c));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer({ ...selectedCustomer, isSuspended: res.data.customer.isSuspended });
      }
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle suspension');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, orderRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/customers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCustomers(custRes.data.customers);
        setOrders(orderRes.data.orders);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loader"></div></div>;

  const verifiedCount = customers.filter(c => c.emailVerified).length;

  return (
    <div style={{ paddingBottom: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Customers</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage registered users and accounts</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>search</span>
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'var(--bg-darker)', border: '1px solid var(--border-color)', borderRadius: '2rem', color: 'var(--text-main)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(160, 32, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(160, 32, 240, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '2rem' }}>group</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Total Customers</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>{customers.length}</h3>
          </div>
        </div>

        <div className="admin-glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '2rem' }}>verified_user</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Verified Accounts</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>{verifiedCount}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Main Data Grid */}
        <div className="admin-glass-card" style={{ flex: selectedCustomer ? 2 : 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'flex 0.3s ease' }}>
          <div style={{ overflowY: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="data-table-row" 
                    style={{ 
                      borderTop: '1px solid var(--border-color)',
                      background: selectedCustomer?.id === customer.id ? 'rgba(160, 32, 240, 0.1)' : 'transparent',
                      borderLeft: selectedCustomer?.id === customer.id ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                  >
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{customer.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {customer.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{customer.email}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{customer.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      {customer.isSuspended ? (
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          Suspended
                        </span>
                      ) : customer.emailVerified ? (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          Verified
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <QuickActionMenu 
                          customer={customer} 
                          onView={() => setSelectedCustomer(customer)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-sidebar)' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
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
        {selectedCustomer && (
          <div className="admin-glass-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', animation: 'fade-in-right 0.3s ease', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Customer Profile</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>#{selectedCustomer.id}</p>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="custom-scrollbar">
              <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }}>{selectedCustomer.name}</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>{selectedCustomer.email}</p>

              <div style={{ width: '100%', background: 'var(--bg-darker)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Account Details</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{selectedCustomer.phone || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                  <span style={{ fontSize: '0.85rem', color: selectedCustomer.isSuspended ? '#ef4444' : selectedCustomer.emailVerified ? '#10b981' : '#f59e0b' }}>
                    {selectedCustomer.isSuspended ? 'Suspended' : selectedCustomer.emailVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Customer Intelligence */}
              <div style={{ width: '100%', marginTop: '2rem' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Customer Intelligence</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders</p>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      {orders.filter(o => o.customer?.id === selectedCustomer.id).length}
                    </p>
                  </div>
                  <div style={{ background: 'rgba(160, 32, 240, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(160, 32, 240, 0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spend</p>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                      GH₵{orders.filter(o => o.customer?.id === selectedCustomer.id && o.status === 'DELIVERED').reduce((sum, o) => sum + o.price, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div style={{ width: '100%' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Order History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {orders.filter(o => o.customer?.id === selectedCustomer.id).slice(0, 5).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Order #{o.id.slice(-6).toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)' }}>GH₵{o.price.toFixed(2)}</p>
                        <span className={`badge badge-${o.status.toLowerCase()}`} style={{ fontSize: '0.5rem', padding: '2px 6px' }}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.customer?.id === selectedCustomer.id).length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No orders placed yet.</p>
                  )}
                </div>
              </div>

              <div style={{ width: '100%', marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                 <button onClick={() => window.location.href = `mailto:${selectedCustomer.email}`} style={{ flex: 1, padding: '0.75rem', background: 'rgba(160, 32, 240, 0.1)', border: '1px solid rgba(160, 32, 240, 0.3)', color: '#D8B4FE', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} className="nav-item-hover">
                   <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>mail</span> Email
                 </button>
                 <button onClick={() => handleToggleSuspend(selectedCustomer.id)} style={{ flex: 1, padding: '0.75rem', background: selectedCustomer.isSuspended ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: selectedCustomer.isSuspended ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: selectedCustomer.isSuspended ? '#10b981' : '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} className="nav-item-hover">
                   <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{selectedCustomer.isSuspended ? 'check_circle' : 'block'}</span> {selectedCustomer.isSuspended ? 'Unsuspend' : 'Suspend'}
                 </button>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Customers;
