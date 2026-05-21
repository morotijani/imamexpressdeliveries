import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLoadScript, Autocomplete, GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';

const libraries: ("places")[] = ["places"];

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

const packageTypes = [
  { id: 'documents', name: 'Documents', icon: '📄' },
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'fragile', name: 'Fragile', icon: '🍷' },
  { id: 'other', name: 'Other', icon: '📦' }
];

const CreateOrder: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    receiverName: '',
    receiverContact: '',
    packageDescription: '',
    packageType: 'documents'
  });

  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  const [distanceEstimate, setDistanceEstimate] = useState<number | null>(null);
  const [priceMultiplier, setPriceMultiplier] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [savedAddresses, setSavedAddresses] = useState({ home: '', work: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [canSubmit, setCanSubmit] = useState(false);

  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handlePackageSelect = (id: string) => {
    setFormData({ ...formData, packageType: id });
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      const addr = place.formatted_address || place.name || '';
      setFormData(prev => ({ ...prev, pickupLocation: addr }));
      setErrors(prev => ({ ...prev, pickupLocation: '' }));
    }
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocompleteRef.current) {
      const place = dropoffAutocompleteRef.current.getPlace();
      const addr = place.formatted_address || place.name || '';
      setFormData(prev => ({ ...prev, dropoffLocation: addr }));
      setErrors(prev => ({ ...prev, dropoffLocation: '' }));
    }
  };

  const directionsCallback = useCallback((res: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (res !== null) {
      if (status === 'OK') {
        setDirections(res);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (formData.pickupLocation && formData.dropoffLocation) {
        try {
          const res = await axios.post('http://localhost:5000/api/orders/estimate', {
            pickupLocation: formData.pickupLocation,
            dropoffLocation: formData.dropoffLocation,
            packageType: formData.packageType
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPriceEstimate(res.data.estimate);
          setDistanceEstimate(res.data.distance);
          setPriceMultiplier(res.data.multiplier);
        } catch (err: any) {
          console.error("Failed to fetch estimate", err);
          setPriceEstimate(null);
          setDistanceEstimate(null);
          setPriceMultiplier(null);
        }
      } else {
        setPriceEstimate(null);
        setDistanceEstimate(null);
        setDirections(null);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchEstimate();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.pickupLocation, formData.dropoffLocation, formData.packageType, token]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedAddresses({
          home: res.data.user.homeAddress || '',
          work: res.data.user.workAddress || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile addresses:', err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (step === 4) {
      setCanSubmit(false);
      const timer = setTimeout(() => {
        setCanSubmit(true);
      }, 1000); // 1-second review safety cooldown
      return () => clearTimeout(timer);
    } else {
      setCanSubmit(false);
    }
  }, [step]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 4) {
      nextStep();
      return;
    }

    if (!canSubmit) {
      return;
    }

    if (!validateStep(1)) {
      setStep(1);
      toast.error('Please enter valid pickup and dropoff locations');
      return;
    }
    if (!validateStep(2)) {
      setStep(2);
      toast.error('Please enter valid receiver details');
      return;
    }
    if (!validateStep(3)) {
      setStep(3);
      toast.error('Please enter valid package details');
      return;
    }

    setLoading(true);

    try {
      // Combine package type and description for the backend
      const payload = {
        ...formData,
        packageDescription: `${formData.packageType.toUpperCase()}: ${formData.packageDescription}`
      };

      const orderPromise = axios.post('http://localhost:5000/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.promise(orderPromise, {
        loading: 'Creating your order...',
        success: () => {
          setFormData({
            pickupLocation: '', dropoffLocation: '', receiverName: '', receiverContact: '', packageDescription: '', packageType: 'documents'
          });
          setPriceEstimate(null);
          setDistanceEstimate(null);
          setPriceMultiplier(null);
          setDirections(null);
          setStep(1);
          setErrors({});
          setTimeout(() => {
            navigate('/customer/history');
          }, 1500); // Redirect after 1.5 seconds to let them see the success message
          return 'Order created successfully!';
        },
        error: (err) => err.response?.data?.message || 'Failed to create order'
      });
    } catch (err: any) {
      // Handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.pickupLocation.trim()) {
        newErrors.pickupLocation = 'Pickup location is required';
      }
      if (!formData.dropoffLocation.trim()) {
        newErrors.dropoffLocation = 'Drop-off location is required';
      }
    } else if (currentStep === 2) {
      if (!formData.receiverName.trim()) {
        newErrors.receiverName = 'Receiver name is required';
      }
      const contactTrimmed = formData.receiverContact.trim();
      if (!contactTrimmed) {
        newErrors.receiverContact = 'Receiver contact is required';
      } else {
        const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
        if (!phoneRegex.test(contactTrimmed)) {
          newErrors.receiverContact = 'Please enter a valid phone number (10-15 digits)';
        }
      }
    } else if (currentStep === 3) {
      if (!formData.packageDescription.trim()) {
        newErrors.packageDescription = 'Package description is required';
      }
      if (!formData.packageType) {
        newErrors.packageType = 'Package type is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fix the errors before moving to the next step');
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const variants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Where are we going?</h3>
            <div style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ position: 'absolute', left: '0', top: '24px', bottom: '30px', borderLeft: '2px dashed rgba(160, 32, 240, 0.3)' }}></div>
              <div style={{ position: 'absolute', left: '-4px', top: '24px', width: '10px', height: '10px', background: 'var(--text-main)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', left: '-4px', bottom: '30px', width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }}></div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 0 }}>Pick up Location</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {savedAddresses.home && <span onClick={() => setFormData(prev => ({ ...prev, pickupLocation: savedAddresses.home }))} style={{ fontSize: '0.65rem', background: 'rgba(160,32,240,0.2)', color: '#D8B4FE', padding: '2px 8px', borderRadius: '10px', cursor: 'pointer' }} className="nav-item-hover">🏡 Home</span>}
                    {savedAddresses.work && <span onClick={() => setFormData(prev => ({ ...prev, pickupLocation: savedAddresses.work }))} style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '10px', cursor: 'pointer' }} className="nav-item-hover">🏢 Work</span>}
                  </div>
                </div>
                {isLoaded ? (
                  <Autocomplete onLoad={(autoC) => pickupAutocompleteRef.current = autoC} onPlaceChanged={onPickupPlaceChanged}>
                    <input type="text" className="input-field" name="pickupLocation" placeholder="Search pickup address" value={formData.pickupLocation} onChange={handleChange} required />
                  </Autocomplete>
                ) : (
                  <input type="text" className="input-field" name="pickupLocation" placeholder="Enter pickup address" value={formData.pickupLocation} onChange={handleChange} required />
                )}
                {errors.pickupLocation && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.4rem' }}>{errors.pickupLocation}</p>}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 0 }}>Drop off Location</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {savedAddresses.home && <span onClick={() => setFormData(prev => ({ ...prev, dropoffLocation: savedAddresses.home }))} style={{ fontSize: '0.65rem', background: 'rgba(160,32,240,0.2)', color: '#D8B4FE', padding: '2px 8px', borderRadius: '10px', cursor: 'pointer' }} className="nav-item-hover">🏡 Home</span>}
                    {savedAddresses.work && <span onClick={() => setFormData(prev => ({ ...prev, dropoffLocation: savedAddresses.work }))} style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '10px', cursor: 'pointer' }} className="nav-item-hover">🏢 Work</span>}
                  </div>
                </div>
                {isLoaded ? (
                  <Autocomplete onLoad={(autoC) => dropoffAutocompleteRef.current = autoC} onPlaceChanged={onDropoffPlaceChanged}>
                    <input type="text" className="input-field" name="dropoffLocation" placeholder="Search delivery address" value={formData.dropoffLocation} onChange={handleChange} required />
                  </Autocomplete>
                ) : (
                  <input type="text" className="input-field" name="dropoffLocation" placeholder="Enter delivery address" value={formData.dropoffLocation} onChange={handleChange} required />
                )}
                {errors.dropoffLocation && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.4rem' }}>{errors.dropoffLocation}</p>}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Who is receiving it?</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Receiver's Name</label>
                <input type="text" className="input-field" name="receiverName" placeholder="Hamza Ibrahim" value={formData.receiverName} onChange={handleChange} required />
                {errors.receiverName && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.4rem' }}>{errors.receiverName}</p>}
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact</label>
                <input type="text" className="input-field" name="receiverContact" placeholder="+1234567890" value={formData.receiverContact} onChange={handleChange} required />
                {errors.receiverContact && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.4rem' }}>{errors.receiverContact}</p>}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>What's in the package?</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Package Description</label>
              <textarea
                className="input-field"
                name="packageDescription"
                placeholder="E.g. Fragile glass box, 2kg"
                value={formData.packageDescription}
                onChange={handleChange}
                style={{ height: '80px', resize: 'none' }}
                required
              ></textarea>
              {errors.packageDescription && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.4rem' }}>{errors.packageDescription}</p>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label" style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Choose Package Type</label>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                {packageTypes.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.id)}
                    style={{
                      flex: '0 0 auto',
                      width: '100px',
                      height: '110px',
                      background: formData.packageType === pkg.id ? 'var(--bg-darker)' : 'var(--bg-sidebar)',
                      border: formData.packageType === pkg.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{pkg.icon}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: formData.packageType === pkg.id ? 'var(--text-main)' : 'var(--text-muted)' }}>{pkg.name}</div>
                  </div>
                ))}
              </div>
              {errors.packageType && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.4rem' }}>{errors.packageType}</p>}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Review & Confirm</h3>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Route</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0.25rem 0' }}><span style={{ color: 'var(--text-main)' }}>From:</span> {formData.pickupLocation}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0' }}><span style={{ color: 'var(--primary)' }}>To:</span> {formData.dropoffLocation}</p>
              </div>
              <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Receiver</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0' }}>{formData.receiverName}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Package</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0' }}>{packageTypes.find(p => p.id === formData.packageType)?.name}</p>
                </div>
              </div>
            </div>

            {priceEstimate !== null && (
              <div style={{ background: 'rgba(160, 32, 240, 0.1)', border: '1px solid rgba(160, 32, 240, 0.3)', borderRadius: '1rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Price</p>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>GH₵{priceEstimate.toFixed(2)}</h3>
                </div>
                {priceMultiplier && priceMultiplier > 1.0 && (
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    x{priceMultiplier} Rate
                  </span>
                )}
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  const leftContent = (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', marginTop: '5px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Create Order</h2>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ width: '8px', height: '8px', borderRadius: '50%', background: s === step ? 'var(--primary)' : 'var(--border-color)' }} />
          ))}
        </div>
      </div>

      {loadError && (
        <div style={{ background: '#5b21b6', color: '#ede9fe', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          Warning: Google Maps failed to load. Auto-complete will be disabled.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ flex: 1, borderRadius: '2rem', padding: '1rem' }}>
              Back
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 2, borderRadius: '2rem', padding: '1rem' }}>
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                flex: 2,
                borderRadius: '2rem',
                padding: '1rem',
                background: !canSubmit ? 'rgba(160, 32, 240, 0.4)' : 'var(--primary)',
                borderColor: !canSubmit ? 'transparent' : 'var(--primary)',
                cursor: !canSubmit ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              disabled={loading || !canSubmit}
            >
              {loading ? 'Processing...' : !canSubmit ? 'Reviewing (1s)...' : 'Confirm Order'}
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const rightContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          options={mapOptions}
        >
          {formData.pickupLocation && formData.dropoffLocation && !directions && (
            <DirectionsService
              options={{
                destination: formData.dropoffLocation,
                origin: formData.pickupLocation,
                travelMode: google.maps.TravelMode.DRIVING
              }}
              callback={directionsCallback}
            />
          )}

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: { strokeColor: '#A020F0', strokeWeight: 6 },
                suppressMarkers: false,
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          Loading Map...
        </div>
      )}

      {/* Floating Estimation Badge */}
      {priceEstimate !== null && distanceEstimate !== null && (
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          padding: '1rem 2rem',
          borderRadius: '2rem',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          color: '#111'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Time</div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{Math.round(distanceEstimate * 3)} min</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#eee' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>GH₵{priceEstimate.toFixed(2)}</div>
              {priceMultiplier && priceMultiplier !== 1.0 && (
                <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700 }}>
                  x{priceMultiplier} Rate
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <AppLayout leftContent={leftContent} rightContent={rightContent} overlayMode={true} />;
};

export default CreateOrder;
