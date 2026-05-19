import React from 'react';
import { motion } from 'framer-motion';

const Careers: React.FC = () => {
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
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }} className="text-gradient">Join Our Fleet</h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Drive with Imam Express. Earn competitive rates, enjoy flexible hours, and be part of Accra's fastest logistics network.
          </p>
        </motion.div>
        
        <motion.div variants={fadeInUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {[
            { title: 'Flexible Schedule', desc: 'Work when you want. You are your own boss.', icon: 'schedule' },
            { title: 'Weekly Payouts', desc: 'Get paid on time, directly to your mobile money or bank.', icon: 'payments' },
            { title: 'Insurance Coverage', desc: 'Active dispatch insurance covering you on duty.', icon: 'health_and_safety' }
          ].map((benefit, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '1.25rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>{benefit.icon}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{benefit.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{benefit.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(22, 22, 28, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4rem', borderRadius: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Apply today and start delivering within 48 hours.</p>
          <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '2rem', fontSize: '1rem', fontWeight: 700 }}>
            Apply as a Rider
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Careers;
