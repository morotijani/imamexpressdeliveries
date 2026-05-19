import React from 'react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
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
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(160, 32, 240, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }} className="text-gradient">Get in Touch</h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)' }}>We are available 24/7 to assist with your logistics needs.</p>
        </motion.div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }} className="mobile-column-layout">
          <motion.div variants={fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(160, 32, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>support_agent</span>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Customer Support</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>+233 24 123 4567</p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>support@imamexpress.com</p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>location_on</span>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Head Office</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>14 Independence Avenue,</p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Accra Central, Ghana</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <form style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Send a Message</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" style={{ width: '100%', background: '#23232a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', color: '#fff', outline: 'none' }} placeholder="John Doe" />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
                <input type="email" style={{ width: '100%', background: '#23232a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', color: '#fff', outline: 'none' }} placeholder="john@example.com" />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Message</label>
                <textarea rows={4} style={{ width: '100%', background: '#23232a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', color: '#fff', outline: 'none', resize: 'none' }} placeholder="How can we help?"></textarea>
              </div>

              <button type="button" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 700 }}>
                Submit Message
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
