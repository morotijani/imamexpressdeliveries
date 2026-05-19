import React from 'react';
import { motion } from 'framer-motion';

const CookiePolicy: React.FC = () => {
  return (
    <div style={{ padding: '6rem 5%', background: '#16161c', color: '#fff' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }} className="text-gradient">Cookie Policy</h1>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <p>Last updated: May 2026</p>
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>1. What are cookies?</h3>
          <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work or work more efficiently, as well as to provide reporting information.</p>
          
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>2. How we use cookies</h3>
          <p>We use cookies to enhance your experience on our platform, such as keeping you signed in, remembering your preferences, and analyzing our site traffic to optimize performance.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default CookiePolicy;
