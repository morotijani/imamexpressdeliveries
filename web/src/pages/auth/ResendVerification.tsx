import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLoadScript } from '@react-google-maps/api';
import AuthLayout from '../../components/AuthLayout';
import logo from '../assets/logo-transparent.png';

const ResendVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>('Detecting location...');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    if (navigator.geolocation && isLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geocoder = new google.maps.Geocoder();
          const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          geocoder.geocode({ location: userLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const addressComponents = results[0].address_components;
              const city = addressComponents.find(c => c.types.includes('locality'))?.long_name ||
                addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
              setLocationName(city || 'Unknown Location');
            }
          });
        },
        () => {
          setLocationName('Accra, Ghana');
        }
      );
    }
  }, [isLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, { email });
      toast.success('Verification email resent! Please check your inbox.');
      navigate('/register-success', { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout locationName={locationName}>
      {/* Left Column: Branding / Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '1rem' }}>
        <img src={logo} alt="Imam Express" style={{ width: '56px', height: '56px', marginBottom: '1.5rem', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(160,32,240,0.2)' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Resend Email</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>Get a new verification link</p>
      </div>

      {/* Right Column: Form */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div className="google-input-group" style={{ marginBottom: '2.5rem' }}>
            <input
              type="email"
              className="google-input"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="google-input-label">Email Address</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Back to Sign in</Link>
            <button type="submit" style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '2rem', 
              padding: '0.6rem 1.5rem', 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit'
            }} disabled={loading}>
              {loading ? 'Sending...' : 'Resend Link'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResendVerification;
