import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setStatus('success');
        toast.success('Email verified successfully!');
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  const leftContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
      {status === 'loading' && (
        <>
          <div className="loader" style={{ marginBottom: '2rem' }}></div>
          <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 900 }}>Verifying your email...</h2>
          <p className="text-muted">Please wait while we confirm your account.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '2rem',
            border: '1px solid #10b981'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#10b981' }}>verified</span>
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Email Verified!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2.5rem' }}>
            Your email has been successfully verified. You can now access all features of Imam Express.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', maxWidth: '300px', padding: '1rem', borderRadius: '2rem' }}
            onClick={() => navigate('/login')}
          >
            Go to Sign In
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '2rem',
            border: '1px solid #ef4444'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#ef4444' }}>error</span>
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Verification Failed</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2.5rem' }}>
            The verification link is invalid or has expired. Please try registering again or contact support.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', maxWidth: '300px', padding: '1rem', borderRadius: '2rem' }}
            onClick={() => navigate('/register')}
          >
            Back to Registration
          </button>
        </>
      )}
    </div>
  );

  return <AppLayout leftContent={leftContent} />;
};

export default VerifyEmail;
