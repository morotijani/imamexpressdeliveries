import React from 'react';
import { motion } from 'framer-motion';

const InsuranceInfo: React.FC = () => {
  return (
    <div style={{ padding: '6rem 5%' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }} className="text-gradient">Insurance & Coverage</h1>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">health_and_safety</span>
            </div>
            <h2 style={{ color: '#fff', margin: 0 }}>Fully Protected Transits</h2>
          </div>
          
          <p>Every package dispatched through Imam Express Deliveries automatically qualifies for our baseline transit insurance up to GH₵ 500 in value.</p>
          
          <h3 style={{ color: '#fff', marginTop: '2rem' }}>Premium Coverage</h3>
          <p>For high-value items, vendors and customers can opt for Premium Cargo Insurance during the checkout process. This covers items up to GH₵ 10,000 against damage, loss, or theft during active transit.</p>

          <h3 style={{ color: '#fff', marginTop: '2rem' }}>Claims Process</h3>
          <p>In the rare event of an incident, claims are processed digitally via your dashboard within 48 hours of submission. Photographic evidence of packing is required for fragile items.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default InsuranceInfo;
