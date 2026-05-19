import React from 'react';
import { motion } from 'framer-motion';

const PartnerNetwork: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const partners = [
    { name: 'Ohemaa Detergents', type: 'E-commerce' },
    { name: 'Explicit Hub', type: 'Retail' },
    { name: 'NamibraPay', type: 'Fintech' },
    { name: 'Way3-Ready', type: 'Tech & Delivery' },
    { name: 'Kokuromotie', type: 'Systems' },
    { name: 'Accra Mall Hub', type: 'Enterprise' }
  ];

  return (
    <div style={{ padding: '6rem 5%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }} className="text-gradient">Our Partner Network</h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Imam Express powers the logistics engine for some of Accra's fastest-growing businesses. Join our network and scale your operations.
          </p>
        </motion.div>
        
        <motion.div variants={fadeInUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {partners.map((p, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{p.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', background: 'rgba(160, 32, 240, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 600 }}>{p.type}</span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 22, 28, 0.9) 100%)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '4rem', borderRadius: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Become a Corporate Partner</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Get dedicated API access, bulk discounts, and priority dispatching.</p>
          <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '2rem', fontSize: '1rem', fontWeight: 700, background: '#22c55e', color: '#000', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}>
            Contact Partnerships Team
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PartnerNetwork;
