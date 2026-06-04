import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';
import logo from '../../assets/logo-transparent.png';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      toast.error('Invalid or missing reset token.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid token. Please request a new password reset link.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    const passwordSpecialRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!passwordSpecialRegex.test(password)) {
      toast.error('Password must contain at least one special character');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        token,
        newPassword: password
      });
      toast.success(response.data.message || 'Password reset successful!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Left Column: Branding / Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '1rem' }}>
        <img src={logo} alt="Imam Express" style={{ width: '56px', height: '56px', marginBottom: '1.5rem', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(160,32,240,0.2)' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Create new password</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
          You're almost there! Enter a new, secure password to regain access to your account.
        </p>
      </div>

      {/* Right Column: Form */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

          <div className="google-input-group">
            <input
              type="password"
              className="google-input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="google-input-label">New Password</label>
          </div>

          <div className="google-input-group" style={{ marginBottom: '2rem' }}>
            <input
              type="password"
              className="google-input"
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label className="google-input-label">Confirm New Password</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Back to login</Link>
            <button type="submit" style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              padding: '0.6rem 1.5rem',
              fontWeight: 600,
              cursor: (loading || !token) ? 'not-allowed' : 'pointer',
              opacity: (loading || !token) ? 0.7 : 1,
              fontFamily: 'inherit'
            }} disabled={loading || !token}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
