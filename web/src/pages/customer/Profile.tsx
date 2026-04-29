import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

const Profile: React.FC = () => {
  const { token, user: authUser, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { name, email, phone } = res.data.user;
        setFormData({ name, email, phone: phone || '' });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile details.' });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local auth context if the user details changed
      if (authUser) {
        login(res.data.user, token!);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  const leftContent = (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: '0.8rem', color: '#fff' }}>My Profile</h2>

      {loading ? (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>Loading details...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          {message.text && (
            <div style={{
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: message.type === 'success' ? '#6EE7B7' : '#FCA5A5',
              padding: '1rem',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {message.text}
            </div>
          )}

          <div className="input-group">
            <label className="input-label" style={{ color: '#fff' }}>Full Name</label>
            <input
              type="text"
              className="input-field"
              style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, paddingLeft: 0 }}
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: '#fff' }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, paddingLeft: 0 }}
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: '#fff' }}>Phone Number</label>
            <input
              type="text"
              className="input-field"
              style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, paddingLeft: 0 }}
              name="phone"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', borderRadius: '2rem', padding: '1rem' }}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Update Profile'}
          </button>
        </form>
      )}
    </div>
  );

  const rightContent = (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      flexDirection: 'column',
      padding: '2rem'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        background: 'var(--primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        color: '#fff',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 25px rgba(210, 74, 61, 0.2)'
      }}>
        {formData.name.charAt(0).toUpperCase() || 'U'}
      </div>
      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>{formData.name || 'Your Name'}</h2>
      <p style={{ color: '#64748b', fontSize: '1rem' }}>{authUser?.role} Account</p>

      <div style={{ marginTop: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Status</p>
          <p style={{ fontWeight: 600, color: '#10b981' }}>Verified & Active</p>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Member Since</p>
          <p style={{ fontWeight: 600, color: '#1e293b' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );

  return <AppLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default Profile;
