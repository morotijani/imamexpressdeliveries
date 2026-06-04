import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';
import logo from '../../assets/logo-transparent.png';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setSubmitted(true);
      toast.success(response.data.message || 'Reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Left Column: Branding / Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '1rem' }}>
        <img src={logo} alt="Imam Express" style={{ width: '56px', height: '56px', marginBottom: '1.5rem', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(160,32,240,0.2)' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Forgot password?</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
          {submitted 
            ? 'Check your inbox for the reset link.' 
            : "No worries, it happens to the best of us! Enter your email address below and we'll send you a link to reset it."}
        </p>
      </div>

      {/* Right Column: Form */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(160, 32, 240, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>mark_email_read</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <Link to="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'var(--primary)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '2rem',
              padding: '0.8rem 1.5rem',
              fontWeight: 600,
            }}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="google-input-group" style={{ marginBottom: '2rem' }}>
              <input
                type="email"
                className="google-input"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="google-input-label">Email address</label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Remember your password?</Link>
              <button type="submit" style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '2rem',
                padding: '0.6rem 1.5rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit'
              }} disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
