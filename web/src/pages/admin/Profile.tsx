import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminProfile: React.FC = () => {
  const { token, user: authUser, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { name, email, phone, profileImage } = res.data.user;
        setFormData({ name, email, phone: phone || '', profileImage: profileImage || '' });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        toast.error('Failed to load profile details.');
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, profileImage: base64 });
        
        setSaving(true);
        try {
          const res = await axios.put('http://localhost:5000/api/user/profile', 
            { ...formData, profileImage: base64 }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (authUser) {
            login(res.data.user, token!);
          }
          toast.success('Profile picture updated!');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
        } finally {
          setSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await axios.put('http://localhost:5000/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (authUser) {
        login(res.data.user, token!);
      }
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Administrator Profile</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal account information and security</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Avatar */}
        <div className="admin-glass-card" style={{ padding: '2rem', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.5rem' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: formData.profileImage ? `url(${formData.profileImage}) center/cover` : 'var(--primary)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '3.5rem',
              color: '#fff',
              overflow: 'hidden',
              border: '4px solid rgba(160, 32, 240, 0.2)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              {!formData.profileImage && (formData.name.charAt(0).toUpperCase() || 'A')}
            </div>
            <button 
              type="button"
              onClick={handleFileClick}
              disabled={saving}
              style={{ 
                position: 'absolute', 
                bottom: '5px', 
                right: '5px', 
                background: 'var(--secondary)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 2,
                opacity: saving ? 0.7 : 1
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>photo_camera</span>
            </button>
          </div>
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem' }}>{formData.name}</h3>
          <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>SYSTEM ADMINISTRATOR</span>
          
          <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>mail</span>
              <span style={{ fontSize: '0.85rem' }}>{formData.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>call</span>
              <span style={{ fontSize: '0.85rem' }}>{formData.phone || 'No phone set'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="admin-glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ color: '#fff' }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: '#fff' }}>Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label" style={{ color: '#fff' }}>Email Address</label>
              <input
                type="email"
                className="input-field"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.8rem 2.5rem', borderRadius: '0.5rem', fontWeight: 600 }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>lock_reset</span>
              Change Password
            </h3>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
                <div className="input-group">
                  <label className="input-label" style={{ color: '#fff', fontSize: '0.75rem' }}>Current Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ color: '#fff', fontSize: '0.75rem' }}>New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ color: '#fff', fontSize: '0.75rem' }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 2rem', fontSize: '0.85rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Note */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(160, 32, 240, 0.05)', border: '1px solid rgba(160, 32, 240, 0.2)', borderRadius: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>security</span>
              <div>
                <h4 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Account Security</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, lineHeight: '1.5' }}>
                  Your account is protected with high-level administrative encryption. To change your password or enable two-factor authentication, please contact the system owner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
