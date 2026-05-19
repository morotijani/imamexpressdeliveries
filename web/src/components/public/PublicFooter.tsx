import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const PublicFooter: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      setIsSubscribing(true);
      const res = await axios.post('http://localhost:5000/api/public/newsletter', { email: newsletterEmail });
      toast.success(res.data.message || 'Subscribed successfully!');
      setNewsletterEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '5rem 5% 2rem 5%',
      background: '#0e0e12',
      marginTop: '6rem'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
        gap: '4rem',
        maxWidth: '1200px',
        margin: '0 auto 4rem auto'
      }} className="mobile-column-layout">
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>local_shipping</span>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Imam Express</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '300px' }}>
            Redefining hyper-local logistics in Accra with real-time tracking, unmatched speed, and secure reliable delivery network.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['public', 'share', 'mail'].map((icon, i) => (
              <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.3s' }} className="hover-bg-light">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#fff' }}>{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Company</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">About Us</Link></li>
            <li><Link to="/careers" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">Careers</Link></li>
            <li><Link to="/partners" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">Partner Network</Link></li>
            <li><Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">Terms of Service</Link></li>
            <li><Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">Privacy Policy</Link></li>
            <li><Link to="/cookies" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">Cookie Policy</Link></li>
            <li><Link to="/insurance" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">Insurance Info</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Subscribe to Newsletter</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Get the latest updates on new service areas and features.</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="email" 
              placeholder="Email address" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '0.75rem 1rem', color: '#fff', outline: 'none', fontSize: '0.85rem' }} 
            />
            <button 
              onClick={handleSubscribe}
              disabled={isSubscribing}
              style={{ background: isSubscribing ? 'gray' : 'var(--primary)', border: 'none', borderRadius: '1rem', padding: '0 1.25rem', color: '#fff', cursor: isSubscribing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isSubscribing ? <span style={{ fontSize: '0.8rem' }}>...</span> : <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>send</span>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          © {new Date().getFullYear()} Imam Express Deliveries Ltd. All rights reserved. Designed with precision.
        </p>
      </div>
    </footer>
  );
};

export default PublicFooter;
