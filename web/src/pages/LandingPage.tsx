import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const transitPhases = [
    { title: 'Order Registered', desc: 'Package registered at Accra Hub. Generating route...', icon: 'receipt_long', color: '#a78bfa' },
    { title: 'Rider Assigned', desc: 'Rider Tijani Moro matched. Dispatched to pickup...', icon: 'pedal_bike', color: 'var(--primary)' },
    { title: 'In Transit', desc: 'En route. Express delivery package secured in thermal bag.', icon: 'local_shipping', color: '#3b82f6' },
    { title: 'Successfully Delivered', desc: 'Handed over safely. Complete in 14 mins!', icon: 'check_circle', color: '#22c55e' }
  ];

  useEffect(() => {
    let interval: any;
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

  // Pricing Logic
  const handleCalculatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    setTimeout(() => {
      let base = 15;
      if (parcelType === 'document') base = 12;
      else if (parcelType === 'fragile') base = 25;
      else if (parcelType === 'bulk') base = 45;

      // Distance factor
      let distanceMultiplier = 1.0;
      if (fromLocation === toLocation) {
        distanceMultiplier = 0.8; // local area
      } else if (
        (fromLocation === 'central' && toLocation === 'tema') || 
        (fromLocation === 'tema' && toLocation === 'central') ||
        (fromLocation === 'madina' && toLocation === 'tema') ||
        (fromLocation === 'tema' && toLocation === 'madina')
      ) {
        distanceMultiplier = 1.8; // far distance
      } else {
        distanceMultiplier = 1.3; // standard cross-town
      }

      const finalPrice = Math.round(base * distanceMultiplier * 10) / 10;
      setCalculatedPrice(finalPrice);
      setIsCalculating(false);
    }, 80000000000000); // Wait 800ms for premium animation feel
    
    // Quick timeout resolver for immediate rendering
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1e0e1a', 
      color: '#fff', 
      fontFamily: "'Outfit', sans-serif", 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Background Neon Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(160, 32, 240, 0.08) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(160, 32, 240, 0.05) 0%, transparent 70%)',
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
        background: 'rgba(30, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(160, 32, 240, 0.3)' }}>
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
        <div>
          <span style={{
            background: 'rgba(160,32,240,0.1)',
            border: '1px solid rgba(160,32,240,0.2)',
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
          </span>
          
          <h1 style={{ 
            fontSize: '3.75rem', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            marginBottom: '1.5rem',
            letterSpacing: '-1.5px'
          }}>
            Fast, Reliable & <br />
            <span className="text-gradient">Premium Logistics</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.15rem', 
            color: 'var(--text-muted)', 
            lineHeight: 1.6, 
            marginBottom: '2.5rem',
            maxWidth: '540px'
          }}>
            Imam Express Deliveries offers hyper-local package shipping across town instantly. Request a rider, watch your live transit, and complete secure payments in seconds.
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="mobile-wrap">
            <button 
              onClick={handleCtaClick}
              className="btn btn-primary"
              style={{ padding: '1rem 2rem', borderRadius: '2rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 6px 20px rgba(160, 32, 240, 0.4)' }}
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
          </div>
        </div>

        {/* Live Simulator Card */}
        <div id="simulator" style={{ zIndex: 3 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
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
                  boxShadow: isSimulating ? 'none' : '0 4px 10px rgba(160, 32, 240, 0.3)'
                }}
              >
                {isSimulating ? 'Simulating...' : 'Run Demo'}
                <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>play_arrow</span>
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
              {/* Connector line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                height: '4px',
                background: 'rgba(255,255,255,0.05)',
                zIndex: 0
              }} />
              {/* Filled line */}
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
                    background: idx <= transitStep ? 'var(--primary)' : '#2b1426',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: idx <= transitStep ? '3px solid #1e0e1a' : '3px solid rgba(255,255,255,0.05)',
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
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              textAlign: 'center',
              minHeight: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: transitPhases[transitStep].color, marginBottom: '0.5rem' }}>
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
        </div>
      </section>

      {/* How It Works Section (4 Steps) */}
      <section style={{
        padding: '6rem 5% 4rem 5%',
        maxWidth: '1200px',
        margin: '0 auto',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="text-gradient">How Imam Express Works</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>A seamless pipeline designed for ultimate speed and convenience.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem'
        }} className="mobile-column-layout">
          {/* Step 1 */}
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{
              background: 'rgba(160, 32, 240, 0.08)',
              color: 'var(--primary-light)',
              width: '80px',
              height: '80px',
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '1px solid rgba(160, 32, 240, 0.15)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>app_registration</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Step 01</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>Booking</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Register your pickup and drop-off coordinates instantly online via our interactive stepper form.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              color: '#3b82f6',
              width: '80px',
              height: '80px',
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '1px solid rgba(59, 130, 246, 0.15)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>inventory_2</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>Step 02</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>Packing</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Our matches secure your item in custom-grade thermal insulated bags protecting fragile products.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{
              background: 'rgba(234, 179, 8, 0.08)',
              color: '#eab308',
              width: '80px',
              height: '80px',
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '1px solid rgba(234, 179, 8, 0.15)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>local_shipping</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', letterSpacing: '1px' }}>Step 03</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>Transportation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Active dispatch routes matched to highly certified riders utilizing real-time dynamic map updates.
            </p>
          </div>

          {/* Step 4 */}
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.08)',
              color: '#22c55e',
              width: '80px',
              height: '80px',
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '1px solid rgba(34, 197, 94, 0.15)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>check_circle</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px' }}>Step 04</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>Delivery</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Handed over safely with digital signature checks and instant status update logs on the dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Network Showcase Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '5rem',
        padding: '6rem 5%',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'center',
        zIndex: 2,
        position: 'relative'
      }} className="mobile-column-layout">
        {/* Left Side: Van Image */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(160, 32, 240, 0.12) 0%, transparent 70%)',
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
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.03)',
              position: 'relative',
              zIndex: 1
            }}
          />
        </div>

        {/* Right Side: Network copy */}
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }} className="text-gradient">
            We Have the Largest <br />
            Delivery Fleet Network
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Our expansive transit coordinate grid ensures complete shipping solutions covering the entire Greater Accra area. From centralized central business hubs to outer residential suburbs, our couriers match coordinates to ensure swift logistics.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            We monitor rider locations with high accuracy, dispatching the nearest fleet member to avoid traffic bottlenecks and ensure deliveries within standard record-breaking periods.
          </p>
          <button 
            onClick={handleCtaClick}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600 }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Specialties Section */}
      <section style={{
        padding: '6rem 5%',
        maxWidth: '1200px',
        margin: '0 auto',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="text-gradient">Our Specialties</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>High-performance tools tailored to ensure exceptional consumer trust.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2.5rem'
        }} className="mobile-column-layout">
          {/* Card 1 */}
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '2rem',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }} className="hover-card">
            <span style={{ fontSize: '4.5rem', fontWeight: 800, color: 'rgba(160, 32, 240, 0.05)', position: 'absolute', top: '-10px', right: '10px', lineHeight: 1 }}>01</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-light)' }}>Easy to Order</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              A premium, streamlined 4-step wizard form to submit delivery bookings within seconds, complete with location auto-complete.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '2rem',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }} className="hover-card">
            <span style={{ fontSize: '4.5rem', fontWeight: 800, color: 'rgba(59, 130, 246, 0.05)', position: 'absolute', top: '-10px', right: '10px', lineHeight: 1 }}>02</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#3b82f6' }}>Secure Payments</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Choose secure payment methods including integrated mobile money transfers, bank updates, or standard cash-on-delivery systems.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '2rem',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }} className="hover-card">
            <span style={{ fontSize: '4.5rem', fontWeight: 800, color: 'rgba(34, 197, 94, 0.05)', position: 'absolute', top: '-10px', right: '10px', lineHeight: 1 }}>03</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#22c55e' }}>Live Tracking</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Accurate GPS coordinates map rendering on active orders. Watch real-time package transitions and rider movements instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '5rem',
        padding: '6rem 5%',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'center',
        zIndex: 2,
        position: 'relative'
      }} className="mobile-column-layout">
        {/* Left Side: Coordinator Illustration */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(160, 32, 240, 0.12) 0%, transparent 70%)',
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
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.03)',
              position: 'relative',
              zIndex: 1
            }}
          />
        </div>

        {/* Right Side: Price Calculator Widget */}
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }} className="text-gradient">Calculate Your Price</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Get a transparent, real-time estimated shipping quote instantly.</p>
          </div>

          <form onSubmit={handleCalculatePrice} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 20px 45px rgba(0,0,0,0.25)'
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
                    fontSize: '0.85rem'
                  }}
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
                    background: '#2b1426',
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
                    background: '#2b1426',
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
                    background: '#2b1426',
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
                boxShadow: '0 4px 15px rgba(160, 32, 240, 0.3)'
              }}
            >
              {isCalculating ? 'Calculating Estimate...' : 'Calculate Estimated Price'}
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>calculate</span>
            </button>

            {calculatedPrice !== null && !isCalculating && (
              <div style={{
                marginTop: '2rem',
                background: 'rgba(160, 32, 240, 0.05)',
                border: '1px solid rgba(160, 32, 240, 0.15)',
                borderRadius: '1.25rem',
                padding: '1.25rem',
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Delivery Cost</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
                  GH₵ {calculatedPrice.toFixed(2)}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Actual pricing matches distance details upon final rider dispatch check.</p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Follow Shipment via GPS Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '5rem',
        padding: '6rem 5% 8rem 5%',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'center',
        zIndex: 2,
        position: 'relative'
      }} className="mobile-column-layout">
        {/* Left Side: Map text */}
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }} className="text-gradient">
            Follow Your Shipment <br />
            via Global GPS
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            We place location tracking directly in your hands. Once a package dispatch starts, watch the transit line progress step-by-step from coordinate matches inside your browser window.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Get accurate arrival estimations (ETA) without picking up the phone. Reliable courier support coordination whenever you need it.
          </p>
          <button 
            onClick={handleCtaClick}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600 }}
          >
            Learn More
          </button>
        </div>

        {/* Right Side: Map Wireframe SVG */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '2.5rem',
          padding: '2rem',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Wireframe Map Grid SVG */}
          <svg viewBox="0 0 500 300" style={{ width: '100%', height: 'auto', background: 'transparent' }}>
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(160, 32, 240, 0.05)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Glowing Map Coordinate Lines */}
            <path d="M50 150 Q 150 50, 250 180 T 450 100" fill="none" stroke="rgba(160, 32, 240, 0.15)" strokeWidth="3" />
            <path d="M80 200 Q 220 120, 320 220 T 420 150" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="2" strokeDasharray="5,5" />

            {/* Suburb Nodes */}
            <circle cx="50" cy="150" r="4" fill="#a78bfa" />
            <text x="50" y="140" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Accra Central</text>

            <circle cx="150" cy="100" r="4" fill="#3b82f6" />
            <text x="150" y="90" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Airport Residential</text>

            <circle cx="280" cy="190" r="4" fill="var(--primary)" />
            <text x="280" y="180" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">East Legon</text>

            <circle cx="420" cy="120" r="4" fill="#22c55e" />
            <text x="420" y="110" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Tema</text>

            {/* Dynamic Rider Pin Animation */}
            <g transform="translate(230, 160)">
              <circle cx="0" cy="0" r="10" fill="var(--primary)" opacity="0.3">
                <animate attributeName="r" values="5;15;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="5" fill="var(--primary)" />
              <path d="M0 0 L 0 -12" stroke="var(--primary)" strokeWidth="2" />
              <circle cx="0" cy="-12" r="3" fill="#fff" />
            </g>
          </svg>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section style={{
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        padding: '4rem 5%',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '3rem',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center'
        }} className="mobile-column-layout">
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }} className="text-gradient">15,000+</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Completed Deliveries</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }} className="text-gradient">99.8%</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>On-Time Rate</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }} className="text-gradient">24 Mins</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Average Shipping Time</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{
        padding: '6rem 5%',
        maxWidth: '1200px',
        margin: '0 auto',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="text-gradient">Our Specialized Logistics</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Premium service categories tailored to every speed and cargo size.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem'
        }} className="mobile-column-layout">
          {/* Card 1 */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '2rem',
            padding: '2.5rem',
            textAlign: 'center',
            transition: 'transform 0.3s ease'
          }} className="hover-card">
            <div style={{
              background: 'rgba(160, 32, 240, 0.1)',
              color: 'var(--primary)',
              width: '64px',
              height: '64px',
              borderRadius: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>bolt</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Express Instant</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Immediate document and critical package courier. A dedicated rider navigates straight to your recipient without stops.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '2rem',
            padding: '2.5rem',
            textAlign: 'center',
            transition: 'transform 0.3s ease'
          }} className="hover-card">
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              width: '64px',
              height: '64px',
              borderRadius: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>inventory_2</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Standard Courier</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Fast and secure package delivery under 2 hours. Perfectly suited for retail orders, lunch packs, and general shipping.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '2rem',
            padding: '2.5rem',
            textAlign: 'center',
            transition: 'transform 0.3s ease'
          }} className="hover-card">
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              width: '64px',
              height: '64px',
              borderRadius: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>local_shipping</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Bulk Cargo</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Heavy cargo and bulk shipping options. Certified logistics vehicles matching specific box dimensions and weights.
            </p>
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section style={{
        padding: '4rem 5% 8rem 5%',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(160, 32, 240, 0.15) 0%, rgba(30, 14, 26, 0.9) 100%)',
          border: '1px solid rgba(160, 32, 240, 0.2)',
          borderRadius: '2.5rem',
          padding: '4rem 3rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to experience next-gen shipping?</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '580px', margin: '0 auto 2.5rem auto' }}>
            Join thousands of individuals and vendors managing express deliveries across town in real-time.
          </p>
          <button 
            onClick={handleCtaClick}
            className="btn btn-primary"
            style={{ padding: '1rem 2.5rem', borderRadius: '2rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto', boxShadow: '0 6px 20px rgba(160, 32, 240, 0.4)' }}
          >
            Create Your Account
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.03)',
        padding: '3rem 5%',
        textAlign: 'center',
        background: '#120710'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }} className="mobile-column-layout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>local_shipping</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Imam Express</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            © {new Date().getFullYear()} Imam Express Deliveries Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
