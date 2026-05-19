import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ background: '#16161c', color: '#fff', padding: '6rem 5%' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }} className="text-gradient">Privacy Policy</h1>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <p>Last updated: May 2026</p>
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>1. Data Collection</h3>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
          
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>2. Use of Information</h3>
          <p>We use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, and send related information.</p>
          
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>3. Sharing of Information</h3>
          <p>We may share the information we collect about you with dispatch riders to enable them to provide the delivery services you request.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
