import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import AuthLayout from '../../components/AuthLayout';
import logo from '../assets/logo-transparent.png';

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
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [homeAutocomplete, setHomeAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [workAutocomplete, setWorkAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
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

  const ghanaPhoneRegex = /^(?:\+233|0)[235][0-9]{8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordSpecialRegex = /[!@#$%^&*(),.?":{}|<>]/;

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill required fields');
        return;
      }
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      const cleanedPhone = formData.phone.replace(/\s+/g, '');
      if (!ghanaPhoneRegex.test(cleanedPhone)) {
        toast.error('Phone number must be a valid Ghana number');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (!passwordSpecialRegex.test(formData.password)) {
      toast.error('Password must contain at least one special character');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
      toast.success('Registration successful!');
      navigate('/register-success', { state: { email: formData.email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout locationName={locationName}>
      {/* Left Column: Branding / Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '1rem' }}>
        <img src={logo} alt="Imam Express" style={{ width: '56px', height: '56px', marginBottom: '1.5rem', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(160,32,240,0.2)' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Create Account</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0, marginBottom: '2rem' }}>Join the Imam Express network</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: s <= step ? 'var(--primary)' : 'var(--border-color)',
              transition: 'background 0.3s ease'
            }} />
          ))}
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Step {step} of 3</p>
      </div>

      {/* Right Column: Form */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          
          {step === 1 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="google-input-group">
                <input type="text" className="google-input" name="name" placeholder=" " value={formData.name} onChange={handleChange} required />
                <label className="google-input-label">Full Name</label>
              </div>
              <div className="google-input-group">
                <input type="text" className="google-input" name="phone" placeholder=" " value={formData.phone} onChange={handleChange} required />
                <label className="google-input-label">Phone Number</label>
              </div>
              <div className="google-input-group" style={{ marginBottom: '2.5rem' }}>
                <input type="email" className="google-input" name="email" placeholder=" " value={formData.email} onChange={handleChange} required />
                <label className="google-input-label">Email Address</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Sign in instead</Link>
                <button type="button" onClick={nextStep} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={`google-input-group ${formData.homeAddress ? 'has-value' : ''}`}>
                {isLoaded ? (
                  <Autocomplete onLoad={setHomeAutocomplete} onPlaceChanged={onHomePlaceChanged}>
                    <input type="text" className="google-input" name="homeAddress" placeholder=" " value={formData.homeAddress} onChange={handleChange} />
                  </Autocomplete>
                ) : (
                  <input type="text" className="google-input" placeholder="Loading autocomplete..." disabled />
                )}
                <label className="google-input-label">Home Address (Optional)</label>
              </div>
              <div className={`google-input-group ${formData.workAddress ? 'has-value' : ''}`}>
                {isLoaded ? (
                  <Autocomplete onLoad={setWorkAutocomplete} onPlaceChanged={onWorkPlaceChanged}>
                    <input type="text" className="google-input" name="workAddress" placeholder=" " value={formData.workAddress} onChange={handleChange} />
                  </Autocomplete>
                ) : (
                  <input type="text" className="google-input" placeholder="Loading autocomplete..." disabled />
                )}
                <label className="google-input-label">Work Address (Optional)</label>
              </div>
              <div className="google-input-group" style={{ marginBottom: '2.5rem' }}>
                <select className="google-input" name="role" value={formData.role} onChange={handleChange}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="RIDER">Rider</option>
                </select>
                <label className="google-input-label">Account Type</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={prevStep} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Back
                </button>
                <button type="button" onClick={nextStep} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="google-input-group">
                <input type="password" className="google-input" name="password" placeholder=" " value={formData.password} onChange={handleChange} required />
                <label className="google-input-label">Password</label>
              </div>
              <div className="google-input-group" style={{ marginBottom: '2.5rem' }}>
                <input type="password" className="google-input" name="confirmPassword" placeholder=" " value={formData.confirmPassword} onChange={handleChange} required />
                <label className="google-input-label">Confirm Password</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={prevStep} disabled={loading} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}>
                  Back
                </button>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }} disabled={loading}>
                  {loading ? 'Creating...' : 'Register'}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
