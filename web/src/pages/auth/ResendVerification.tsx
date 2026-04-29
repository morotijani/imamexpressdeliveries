import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';

const ResendVerification: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
      toast.success('Verification email resent! Please check your inbox.');
      navigate('/register-success', { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const leftContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Resend Email</h2>
        <p className="text-muted">Enter your email to receive a new verification link</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" style={{ color: '#fff' }}>Email Address</label>
          <input 
            type="email" 
            className="input-field" 
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', borderRadius: '2rem', padding: '1.1rem', fontSize: '1.1rem' }} disabled={loading}>
          {loading ? 'Sending...' : 'Resend Verification Link'}
        </button>
      </form>

      <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
      </p>
    </div>
  );

  return <AppLayout leftContent={leftContent} />;
};

export default ResendVerification;
