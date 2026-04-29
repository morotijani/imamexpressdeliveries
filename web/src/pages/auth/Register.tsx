import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
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

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    homeAddress: '', 
    workAddress: '',
    role: 'CUSTOMER' 
  });
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [homeAutocomplete, setHomeAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [workAutocomplete, setWorkAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onHomePlaceChanged = () => {
    if (homeAutocomplete) {
      const place = homeAutocomplete.getPlace();
      if (place.formatted_address) {
        setFormData({ ...formData, homeAddress: place.formatted_address });
      }
    }
  };

  const onWorkPlaceChanged = () => {
    if (workAutocomplete) {
      const place = workAutocomplete.getPlace();
      if (place.formatted_address) {
        setFormData({ ...formData, workAddress: place.formatted_address });
      }
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email) {
        toast.error('Please fill required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success('Registration successful!');
      navigate('/register-success', { state: { email: formData.email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const leftContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Create Account</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ 
              width: '40px', 
              height: '4px', 
              borderRadius: '2px', 
              background: s <= step ? 'var(--primary)' : 'rgba(255,255,255,0.1)' 
            }} />
          ))}
        </div>
        <p className="text-muted">Step {step} of 3</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="step-content animate-in">
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Full Name</label>
              <input type="text" className="input-field" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Phone Number</label>
              <input type="text" className="input-field" name="phone" placeholder="+1234567890" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Email Address</label>
              <input type="email" className="input-field" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', borderRadius: '2rem', padding: '1.1rem' }} onClick={nextStep}>
              Continue to Step 2
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-in">
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Home Address (Optional)</label>
              {isLoaded ? (
                <Autocomplete onLoad={setHomeAutocomplete} onPlaceChanged={onHomePlaceChanged}>
                  <input type="text" className="input-field" name="homeAddress" placeholder="123 Street Name, City" value={formData.homeAddress} onChange={handleChange} />
                </Autocomplete>
              ) : (
                <input type="text" className="input-field" placeholder="Loading autocomplete..." disabled />
              )}
            </div>
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Work Address (Optional)</label>
              {isLoaded ? (
                <Autocomplete onLoad={setWorkAutocomplete} onPlaceChanged={onWorkPlaceChanged}>
                  <input type="text" className="input-field" name="workAddress" placeholder="Office Complex, City" value={formData.workAddress} onChange={handleChange} />
                </Autocomplete>
              ) : (
                <input type="text" className="input-field" placeholder="Loading autocomplete..." disabled />
              )}
            </div>
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Account Type</label>
              <select className="input-field" name="role" value={formData.role} onChange={handleChange}>
                <option value="CUSTOMER">Customer</option>
                <option value="RIDER">Rider</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '2rem', padding: '1.1rem' }} onClick={prevStep}>
                Back
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 2, borderRadius: '2rem', padding: '1.1rem' }} onClick={nextStep}>
                Continue to Step 3
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content animate-in">
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Password</label>
              <input type="password" className="input-field" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ color: '#fff' }}>Confirm Password</label>
              <input type="password" className="input-field" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, borderRadius: '2rem', padding: '1.1rem' }} onClick={prevStep}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: '2rem', padding: '1.1rem' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.9rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
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

export default Register;
