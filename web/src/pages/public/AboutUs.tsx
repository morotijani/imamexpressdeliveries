import React from 'react';
import { motion } from 'framer-motion';

const AboutUs: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div style={{ padding: '6rem 5%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(160, 32, 240, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.h1 variants={fadeInUp} style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem' }} className="text-gradient">
          About Imam Express
        </motion.h1>
        
        <motion.p variants={fadeInUp} style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
          Imam Express Deliveries was founded with a singular vision: to revolutionize hyper-local logistics in the Greater Accra region. We believe that distance shouldn't dictate delivery times, and businesses shouldn't have to choose between speed, security, and affordability.
        </motion.p>
        
        <motion.div variants={fadeInUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary-light)', marginBottom: '1rem' }}>speed</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>To provide the fastest, most reliable delivery network connecting vendors to consumers within minutes, not days.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#3b82f6', marginBottom: '1rem' }}>verified_user</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Our Vision</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>To be the undisputed backbone of local e-commerce and personal logistics in West Africa, driven by technology.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
