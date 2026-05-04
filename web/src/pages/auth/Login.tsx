import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import AppLayout from '../../components/AppLayout';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Accra default

const mapOptions = {
  styles: [{ elementType: "geometry", stylers: [{ color: "#f5f5f5" }] }, { elementType: "labels.icon", stylers: [{ visibility: "off" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] }, { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] }, { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }],
  disableDefaultUI: true,
  zoomControl: true,
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const { login } = useAuth();
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log("Error getting location, using default");
          setLocationName('Accra, Ghana');
        }
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation && isLoaded) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: userLocation }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const addressComponents = results[0].address_components;
          const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || 
                       addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
          setLocationName(city || 'Unknown Location');
        }
      });
    }
  }, [userLocation, isLoaded]);

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

  const leftContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p className="text-muted">Sign in to continue your deliveries</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" style={{ color: '#fff' }}>Email Address</label>
          <input 
            type="email" 
            className="input-field" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="input-group">
          <label className="input-label" style={{ color: '#fff' }}>Password</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', borderRadius: '2rem', padding: '1.1rem', fontSize: '1.1rem' }} disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create one</Link>
      </p>

      {/* Location Status Indicator */}
      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: '#3d1c36', padding: '0.5rem 1.25rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(160, 32, 240, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>location_on</span>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live from {locationName}
          </span>
          <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
        </div>
      </div>
    </div>
  );

  const rightContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={14}
          options={mapOptions}
        >
          {userLocation && <Marker position={userLocation} />}
        </GoogleMap>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          Loading Map...
        </div>
      )}
    </div>
  );

  return <AppLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default Login;
