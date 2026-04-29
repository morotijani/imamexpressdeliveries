import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registeredEmail = location.state?.email || 'your email';
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting location...');

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

  const leftContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        background: 'rgba(160, 32, 240, 0.1)', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '2rem',
        border: '1px solid var(--primary)'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--primary)' }}>mark_email_read</span>
      </div>

      <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Congratulations!</h2>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Your account has been successfully created.</p>
      <p className="text-muted" style={{ marginBottom: '2.5rem', maxWidth: '320px' }}>
        We've sent a verification link to <strong style={{ color: 'var(--primary)' }}>{registeredEmail}</strong>. Please check your inbox and verify your email to activate your account.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        <button 
          className="btn btn-primary" 
          style={{ padding: '1rem', borderRadius: '2rem' }}
          onClick={() => navigate('/login')}
        >
          Go to Sign In
        </button>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '1rem', borderRadius: '2rem', background: 'transparent' }}
          onClick={() => navigate('/resend-verification')}
        >
          Resend Email
        </button>
      </div>

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

export default RegisterSuccess;
