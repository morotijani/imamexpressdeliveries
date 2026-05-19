import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = (() => {
    try {
      return useAuth();
    } catch {
      return { isAuthenticated: false, user: null };
    }
  })();

  const navigate = useNavigate();

  // Transit Simulator State
  const [transitStep, setTransitStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Price Calculator State
  const [bookingDate, setBookingDate] = useState('');
  const [parcelType, setParcelType] = useState('standard');
  const [fromLocation, setFromLocation] = useState('central');
  const [toLocation, setToLocation] = useState('legon');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Live Activity Toast State
  const [activeToast, setActiveToast] = useState<{ message: string, time: string } | null>(null);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const transitPhases = [
    { title: 'Order Registered', desc: 'Package registered at Accra Hub. Generating route...', icon: 'receipt_long', color: '#a78bfa' },
    { title: 'Rider Assigned', desc: 'Rider Tijani Moro matched. Dispatched to pickup...', icon: 'pedal_bike', color: 'var(--primary)' },
    { title: 'In Transit', desc: 'En route. Express delivery package secured in thermal bag.', icon: 'local_shipping', color: '#3b82f6' },
    { title: 'Successfully Delivered', desc: 'Handed over safely. Complete in 14 mins!', icon: 'check_circle', color: '#22c55e' }
  ];

  const liveActivities = [
    { message: "Mohammed just booked a delivery to Madina", time: "Just now" },
    { message: "Fauzia's package delivered safely", time: "2 mins ago" },
    { message: "New rider matching in East Legon", time: "Just now" },
    { message: "Express parcel dispatched to Tema", time: "1 min ago" }
  ];

  const testimonials = [
    { name: "Kwame Mensah", role: "E-commerce Vendor", text: "Imam Express has completely transformed my business. Packages are delivered at lightning speed, and my customers are always happy." },
    { name: "Fauzia Ahmed", role: "Regular Customer", text: "The live tracking feature is incredible. I always know exactly where my package is, and the riders are so professional." },
    { name: "John Doe", role: "Restaurant Owner", text: "Reliable, secure, and fast. I use them for all our bulk food deliveries during peak hours. Exceptional service." }
  ];

  const faqs = [
    { q: "How do I track my package?", a: "Once your order is confirmed and a rider is dispatched, you can track their exact location in real-time from your dashboard." },
    { q: "What are your operating hours?", a: "We operate 24/7 across the Greater Accra region to ensure your logistics needs are met anytime." },
    { q: "Are fragile items insured?", a: "Yes, all our deliveries come with standard transit insurance. We also provide custom-grade thermal insulated bags for fragile and sensitive items." },
    { q: "Can I schedule a delivery in advance?", a: "Absolutely. Our booking wizard allows you to set specific pickup dates and times." }
  ];

  const partners = [
    "Ohemaa Detergents", "Explicit Hub", "Accra Mall", "Kokuromotie Systems", "NamibraPay", "Way3-Ready", "Ohemaa Detergents", "Explicit Hub"
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSimulating) {
      interval = setInterval(() => {
        setTransitStep(prev => {
          if (prev >= 3) {
            setIsSimulating(false);
            return 3;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Live Activity Toast Effect
  useEffect(() => {
    const showToast = () => {
      const randomActivity = liveActivities[Math.floor(Math.random() * liveActivities.length)];
      setActiveToast(randomActivity);
      
      setTimeout(() => {
        setActiveToast(null);
      }, 4000);
    };

    const initialTimeout = setTimeout(showToast, 3000);
    const interval = setInterval(showToast, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const startSimulation = () => {
    setTransitStep(0);
    setIsSimulating(true);
  };

  const handleCtaClick = () => {
    if (isAuthenticated && user) {
      if (user.role === 'CUSTOMER') navigate('/customer');
      else if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'RIDER') navigate('/rider');
    } else {
      navigate('/login');
    }
  };

  const handleCalculatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    setTimeout(() => {
      let base = 15;
      if (parcelType === 'document') base = 12;
      else if (parcelType === 'fragile') base = 25;
      else if (parcelType === 'bulk') base = 45;

      let distanceMultiplier = 1.2;
      if (fromLocation === toLocation) distanceMultiplier = 0.7;
      else if (
        (fromLocation === 'central' && toLocation === 'tema') || 
        (fromLocation === 'tema' && toLocation === 'central')
      ) distanceMultiplier = 1.8;

      const finalPrice = Math.round(base * distanceMultiplier);
      setCalculatedPrice(finalPrice);
      setIsCalculating(false);
    }, 800);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0c', // More subtle, sophisticated dark background
      color: '#fff', 
      fontFamily: "'Outfit', sans-serif", 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Background Subtle Neon Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(160, 32, 240, 0.04) 0%, transparent 60%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '-10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(160, 32, 240, 0.03) 0%, transparent 60%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Top Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 5%',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        background: 'rgba(10, 10, 12, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(160, 32, 240, 0.2)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>local_shipping</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="text-gradient">Imam Express</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isAuthenticated ? (
            <button 
              onClick={handleCtaClick}
              className="btn btn-primary"
              style={{ borderRadius: '2rem', padding: '0.6rem 1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Go to Dashboard <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
            </button>
          ) : (
            <>
              <span onClick={() => navigate('/login')} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} className="hover-light">Sign In</span>
              <button 
                onClick={() => navigate('/register')}
                className="btn btn-primary"
                style={{ borderRadius: '2rem', padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}
              >
                Register Now
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '4rem',
        padding: '6rem 5% 4rem 5%',
        maxWidth: '1300px',
        margin: '0 auto',
        zIndex: 2,
        position: 'relative',
        alignItems: 'center'
      }} className="mobile-column-layout">
        
        {/* Live Activity Toast Container */}
        <AnimatePresence>
          {activeToast && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                top: '2rem',
                left: '5%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2rem',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: 10
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{activeToast.message}</p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{activeToast.time}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span variants={fadeInUp} style={{
            background: 'rgba(160,32,240,0.08)',
            border: '1px solid rgba(160,32,240,0.15)',
            color: 'var(--primary-light)',
            padding: '0.5rem 1.25rem',
            borderRadius: '2rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'inline-block',
            marginBottom: '1.5rem'
          }}>
            ⚡ Ultra-Fast Delivery in Accra
          </motion.span>
          
          <motion.h1 variants={fadeInUp} style={{ 
            fontSize: '3.75rem', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            marginBottom: '1.5rem',
            letterSpacing: '-1.5px'
          }}>
            Fast, Reliable & <br />
            <span className="text-gradient">Premium Logistics</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} style={{ 
            fontSize: '1.15rem', 
            color: 'var(--text-muted)', 
            lineHeight: 1.6, 
            marginBottom: '2.5rem',
            maxWidth: '540px'
          }}>
            Imam Express Deliveries offers hyper-local package shipping across town instantly. Request a rider, watch your live transit, and complete secure payments in seconds.
          </motion.p>

          <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="mobile-wrap">
            <button 
              onClick={handleCtaClick}
              className="btn btn-primary"
              style={{ padding: '1rem 2rem', borderRadius: '2rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 6px 20px rgba(160, 32, 240, 0.3)' }}
            >
              Book a Delivery Now
              <span className="material-symbols-outlined">bolt</span>
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('simulator');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                color: '#fff', 
                padding: '1rem 2rem', 
                borderRadius: '2rem', 
                fontSize: '1rem', 
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="hover-card"
            >
              Try Live Simulator
            </button>
          </motion.div>
        </motion.div>

        {/* Live Simulator Card */}
        <motion.div 
          id="simulator" 
          style={{ zIndex: 3 }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Visual Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Imam Live-Tracker</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Real-time transit simulator</p>
              </div>
              <button 
                onClick={startSimulation}
                disabled={isSimulating}
                style={{
                  background: isSimulating ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isSimulating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                {isSimulating ? 'Simulating...' : 'Run Demo'}
                <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>play_arrow</span>
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                height: '4px',
                background: 'rgba(255,255,255,0.05)',
                zIndex: 0
              }} />
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: `${(transitStep / 3) * 90}%`,
                height: '4px',
                background: 'var(--primary)',
                transition: 'width 0.5s ease',
                zIndex: 0
              }} />

              {transitPhases.map((phase, idx) => (
                <div key={idx} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: idx <= transitStep ? 'var(--primary)' : '#1a1820',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: idx <= transitStep ? '3px solid #0a0a0c' : '3px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.4s ease'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{phase.icon}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: idx <= transitStep ? 700 : 500, color: idx <= transitStep ? '#fff' : 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {phase.title.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Details Bubble */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              textAlign: 'center',
              minHeight: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: transitPhases[transitStep].color, marginBottom: '0.5rem', transition: 'color 0.3s' }}>
                {transitPhases[transitStep].icon}
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {transitPhases[transitStep].title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0', lineHeight: 1.4, maxWidth: '280px' }}>
                {transitPhases[transitStep].desc}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By / Partners Marquee */}
      <section style={{
        padding: '3rem 0',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        background: 'rgba(255,255,255,0.01)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Trusted by top vendors across Accra
          </p>
        </div>
        
        {/* Simple Marquee Animation */}
        <style>
          {`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-content {
              display: flex;
              width: 200%;
              animation: scroll 20s linear infinite;
            }
            .marquee-content:hover {
              animation-play-state: paused;
            }
          `}
        </style>
        <div className="marquee-content">
          {partners.concat(partners).map((partner, idx) => (
            <div key={idx} style={{
              flex: '0 0 auto',
              width: '15%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.6,
              filter: 'grayscale(100%)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'grayscale(0%)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.filter = 'grayscale(100%)'; }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{partner}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        style={{
          padding: '6rem 5% 4rem 5%',
          maxWidth: '1200px',
          margin: '0 auto',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="text-gradient">How Imam Express Works</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>A seamless pipeline designed for ultimate speed and convenience.</p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem'
        }} className="mobile-column-layout">
          {[
            { step: '01', title: 'Booking', desc: 'Register your pickup and drop-off coordinates instantly online via our interactive form.', icon: 'app_registration', color: 'rgba(160, 32, 240, 0.1)', textC: 'var(--primary-light)' },
            { step: '02', title: 'Packing', desc: 'Our matches secure your item in custom-grade thermal insulated bags protecting fragile products.', icon: 'inventory_2', color: 'rgba(59, 130, 246, 0.1)', textC: '#3b82f6' },
            { step: '03', title: 'Transit', desc: 'Active dispatch routes matched to highly certified riders utilizing real-time dynamic map updates.', icon: 'local_shipping', color: 'rgba(234, 179, 8, 0.1)', textC: '#eab308' },
            { step: '04', title: 'Delivery', desc: 'Handed over safely with digital signature checks and instant status update logs on the dashboard.', icon: 'check_circle', color: 'rgba(34, 197, 94, 0.1)', textC: '#22c55e' }
          ].map((s, i) => (
            <motion.div key={i} variants={fadeInUp} style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                background: s.color,
                color: s.textC,
                width: '80px',
                height: '80px',
                borderRadius: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                border: `1px solid ${s.color.replace('0.1', '0.2')}`
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>{s.icon}</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.textC, textTransform: 'uppercase', letterSpacing: '1px' }}>Step {s.step}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>{s.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Network Showcase Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          padding: '6rem 5%',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'center',
          zIndex: 2,
          position: 'relative'
        }} className="mobile-column-layout"
      >
        <motion.div variants={fadeInUp} style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(160, 32, 240, 0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
            zIndex: 0
          }} />
          <img 
            src="/imam_delivery_van.png" 
            alt="Imam Express Delivery Van" 
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.04)',
              position: 'relative',
              zIndex: 1
            }}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }} className="text-gradient">
            We Have the Largest <br />
            Delivery Fleet Network
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Our expansive transit coordinate grid ensures complete shipping solutions covering the entire Greater Accra area. From centralized business hubs to outer residential suburbs, our couriers match coordinates to ensure swift logistics.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            We monitor rider locations with high accuracy, dispatching the nearest fleet member to avoid traffic bottlenecks and ensure deliveries within standard record-breaking periods.
          </p>
          <button 
            onClick={handleCtaClick}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600 }}
          >
            Explore Network
          </button>
        </motion.div>
      </motion.section>

      {/* Pricing Calculator Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '5rem',
          padding: '6rem 5%',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'center',
          zIndex: 2,
          position: 'relative'
        }} className="mobile-column-layout"
      >
        <motion.div variants={fadeInUp} style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(160, 32, 240, 0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
            zIndex: 0
          }} />
          <img 
            src="/customer_assistant.png" 
            alt="Imam Express Logistics Assistant" 
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.04)',
              position: 'relative',
              zIndex: 1
            }}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }} className="text-gradient">Calculate Your Price</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Get a transparent, real-time estimated shipping quote instantly.</p>
          </div>

          <form onSubmit={handleCalculatePrice} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }} className="mobile-column-layout">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Booking Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1rem',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Type of Parcel</label>
                <select 
                  value={parcelType}
                  onChange={(e) => setParcelType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#16141a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1rem',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="document">Document / Letter</option>
                  <option value="standard">Standard Parcel</option>
                  <option value="fragile">Fragile / High-Care</option>
                  <option value="bulk">Bulk Cargo Box</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }} className="mobile-column-layout">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Pickup Area (From)</label>
                <select 
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#16141a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1rem',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="central">Accra Central</option>
                  <option value="legon">East Legon</option>
                  <option value="airport">Airport Residential</option>
                  <option value="madina">Madina</option>
                  <option value="tema">Tema</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Destination Area (To)</label>
                <select 
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#16141a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1rem',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="legon">East Legon</option>
                  <option value="central">Accra Central</option>
                  <option value="airport">Airport Residential</option>
                  <option value="madina">Madina</option>
                  <option value="tema">Tema</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isCalculating}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(160, 32, 240, 0.2)'
              }}
            >
              {isCalculating ? 'Calculating Estimate...' : 'Calculate Estimated Price'}
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>calculate</span>
            </button>

            <AnimatePresence>
              {calculatedPrice !== null && !isCalculating && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  style={{
                    background: 'rgba(160, 32, 240, 0.05)',
                    border: '1px solid rgba(160, 32, 240, 0.15)',
                    borderRadius: '1.25rem',
                    padding: '1.25rem',
                    textAlign: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Delivery Cost</span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
                    GH₵ {calculatedPrice.toFixed(2)}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Actual pricing matches distance details upon final rider dispatch check.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </motion.section>

      {/* Customer Testimonials Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        style={{
          padding: '6rem 5%',
          maxWidth: '1200px',
          margin: '0 auto',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="text-gradient">What Our Customers Say</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Don't just take our word for it.</p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem'
        }} className="mobile-column-layout">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeInUp} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '2rem',
              padding: '2.5rem',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', gap: '0.25rem', color: '#eab308', marginBottom: '1.5rem' }}>
                {[1,2,3,4,5].map(star => <span key={star} className="material-symbols-outlined" style={{ fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}>star</span>)}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '2rem', fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(160, 32, 240, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)', fontWeight: 700 }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{t.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        style={{
          padding: '6rem 5%',
          maxWidth: '800px',
          margin: '0 auto',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="text-gradient">Frequently Asked Questions</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Everything you need to know about Imam Express.</p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeInUp} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '1.25rem',
              overflow: 'hidden'
            }}>
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{faq.q}</span>
                <span className="material-symbols-outlined" style={{ 
                  transform: openFaq === i ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.3s',
                  color: 'var(--primary-light)'
                }}>
                  expand_more
                </span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}
                  >
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* App Download Promo */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        style={{
          padding: '6rem 5% 2rem 5%',
          maxWidth: '1200px',
          margin: '0 auto',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <motion.div variants={fadeInUp} style={{
          background: 'linear-gradient(135deg, rgba(160, 32, 240, 0.1) 0%, rgba(10, 10, 12, 0.9) 100%)',
          border: '1px solid rgba(160, 32, 240, 0.2)',
          borderRadius: '3rem',
          padding: '0',
          display: 'flex',
          overflow: 'hidden',
          alignItems: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }} className="mobile-column-layout">
          <div style={{ padding: '4rem', flex: 1 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Take Imam Express Everywhere</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Download our mobile app to track your packages on the go, manage multiple deliveries, and get instant push notifications. Available on iOS and Android.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }} className="mobile-wrap">
              <button style={{ 
                background: '#fff', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700 
              }}>
                <span className="material-symbols-outlined">apple</span>
                App Store
              </button>
              <button style={{ 
                background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 700 
              }}>
                <span className="material-symbols-outlined">android</span>
                Google Play
              </button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingTop: '2rem', background: 'radial-gradient(circle at center, rgba(160, 32, 240, 0.15) 0%, transparent 70%)' }}>
            <div style={{ width: '250px', height: '400px', background: '#000', border: '8px solid #222', borderBottom: 'none', borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: 'var(--primary)', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Imam Express</span>
              </div>
              <div style={{ flex: 1, background: '#111', padding: '1rem' }}>
                <div style={{ background: '#222', height: '100px', borderRadius: '1rem', marginBottom: '1rem' }}></div>
                <div style={{ background: '#222', height: '60px', borderRadius: '1rem', marginBottom: '0.5rem' }}></div>
                <div style={{ background: '#222', height: '60px', borderRadius: '1rem' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Expanded Premium Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '5rem 5% 2rem 5%',
        background: '#050505',
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
              {['About Us', 'Careers', 'Partner Network', 'Contact'].map(link => (
                <li key={link}><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">{link}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Insurance Info'].map(link => (
                <li key={link}><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} className="hover-light">{link}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Subscribe to Newsletter</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Get the latest updates on new service areas and features.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="Email address" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '0.75rem 1rem', color: '#fff', outline: 'none', fontSize: '0.85rem' }} />
              <button style={{ background: 'var(--primary)', border: 'none', borderRadius: '1rem', padding: '0 1.25rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>send</span>
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
    </div>
  );
};

export default LandingPage;
