import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

const RidersManagement: React.FC = () => {
  const { token } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/riders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRiders(res.data.riders);
      } catch (err) {
        console.error('Failed to fetch riders:', err);
        toast.error('Failed to load riders');
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, [token]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loader"></div></div>;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Riders Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Human resources oversight for logistics personnel</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>person_add</span>
          Onboard Rider
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(160, 32, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(160, 32, 240, 0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '2rem' }}>two_wheeler</span>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Total Fleet Size</p>
            <h3 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800 }}>{riders.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="admin-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Rider Personnel</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Onboarded On</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map(rider => (
                <tr key={rider.id} className="data-table-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                        {rider.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{rider.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {rider.id.split('-')[0]}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', color: '#ccc' }}>{rider.email}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rider.phone || 'No phone'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem', fontSize: '0.9rem', color: '#ccc' }}>
                    {new Date(rider.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                     <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }} className="nav-item-hover">
                       View Profile
                     </button>
                  </td>
                </tr>
              ))}
              {riders.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No riders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RidersManagement;
