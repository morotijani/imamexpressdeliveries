import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLoadScript } from '@react-google-maps/api';
import AuthLayout from '../../components/AuthLayout';
import logo from '../../assets/logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(response.data.user, response.data.token);
      toast.success(`Welcome back, ${response.data.user.name}!`);

      if (response.data.user.role === 'ADMIN') navigate('/admin');
      else if (response.data.user.role === 'RIDER') navigate('/rider');
      else navigate('/customer');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials.';
      toast.error(errorMessage);

      if (err.response?.status === 403 && errorMessage.includes('verify your email')) {
        setTimeout(() => {
          navigate('/resend-verification', { state: { email } });
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout locationName={locationName}>
      {/* Left Column: Branding / Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '1rem' }}>
        <img src={logo} alt="Imam Express" style={{ width: '56px', height: '56px', marginBottom: '1.5rem', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(160,32,240,0.2)' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Sign in</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>Use your Imam Express Account</p>
      </div>

      {/* Right Column: Form */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

          <div className="google-input-group">
            <input
              type="email"
              className="google-input"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="google-input-label">Email or phone</label>
          </div>

          <div className="google-input-group" style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              className="google-input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="google-input-label">Password</label>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '2.5rem' }}>
            New here? You can create an account by clicking the create account link below. <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Learn more about using Imam Express</a>
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Create account</Link>
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
              {loading ? 'Authenticating...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
