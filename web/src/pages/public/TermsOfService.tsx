import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
  return (
    <div style={{ padding: '6rem 5%', color: '#fff' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }} className="text-gradient">Terms of Service</h1>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <p>Last updated: May 2026</p>
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>1. Acceptance of Terms</h3>
          <p>By accessing and using Imam Express Deliveries, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>2. Description of Service</h3>
          <p>Imam Express provides hyper-local logistics and courier services within the Greater Accra region. We act as a platform connecting users to independent dispatch riders.</p>
          
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>3. User Responsibilities</h3>
          <p>Users must provide accurate pickup and drop-off coordinates. Imam Express is not liable for failed deliveries due to incorrect address information.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
