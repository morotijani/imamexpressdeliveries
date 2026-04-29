import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLoadScript, Autocomplete, GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import AppLayout from '../../components/AppLayout';

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Accra default

const mapOptions = {
  styles: [ { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] }, { elementType: "labels.icon", stylers: [{ visibility: "off" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] }, { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] }, { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] } ],
  disableDefaultUI: true,
  zoomControl: true,
};

const packageTypes = [
  { id: 'documents', name: 'Documents', icon: '📄' },
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'other', name: 'Other', icon: '📦' }
];

const CreateOrder: React.FC = () => {
  const { token } = useAuth();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    receiverName: '',
    receiverContact: '',
    packageDescription: 'documents'
  });
  
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  const [distanceEstimate, setDistanceEstimate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePackageSelect = (id: string) => {
    setFormData({ ...formData, packageDescription: id });
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({ ...prev, pickupLocation: place.formatted_address! }));
      } else if (place.name) {
        setFormData(prev => ({ ...prev, pickupLocation: place.name || '' }));
      }
    }
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocompleteRef.current) {
      const place = dropoffAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({ ...prev, dropoffLocation: place.formatted_address! }));
      } else if (place.name) {
        setFormData(prev => ({ ...prev, dropoffLocation: place.name || '' }));
      }
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
            dropoffLocation: formData.dropoffLocation
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPriceEstimate(res.data.estimate);
          setDistanceEstimate(res.data.distance);
        } catch (err: any) {
          console.error("Failed to fetch estimate", err);
          setPriceEstimate(null);
          setDistanceEstimate(null);
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
  }, [formData.pickupLocation, formData.dropoffLocation, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('http://localhost:5000/api/orders', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setFormData({
        pickupLocation: '', dropoffLocation: '', receiverName: '', receiverContact: '', packageDescription: 'documents'
      });
      setPriceEstimate(null);
      setDistanceEstimate(null);
      setDirections(null);
    } catch (err: any) {
      const backendError = err.response?.data?.error;
      const message = err.response?.data?.message || 'Failed to create order';
      setError(backendError ? `${message}: ${backendError}` : message);
    } finally {
      setLoading(false);
    }
  };

  const leftContent = (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#fff' }}>Delivery Details</h2>
      
      {loadError && (
        <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
          Warning: Google Maps failed to load. Auto-complete will be disabled.
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
          Request submitted! A rider will be assigned.
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ position: 'absolute', left: '0', top: '24px', bottom: '30px', borderLeft: '2px dashed rgba(255,255,255,0.2)' }}></div>
          <div style={{ position: 'absolute', left: '-4px', top: '24px', width: '10px', height: '10px', background: '#fff', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', left: '-4px', bottom: '30px', width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}></div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sender's Address</label>
            {isLoaded ? (
              <Autocomplete onLoad={(autoC) => pickupAutocompleteRef.current = autoC} onPlaceChanged={onPickupPlaceChanged}>
                <input type="text" className="input-field" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, paddingLeft: 0, paddingRight: 0 }} name="pickupLocation" placeholder="Search pickup address" value={formData.pickupLocation} onChange={handleChange} required />
              </Autocomplete>
            ) : (
              <input type="text" className="input-field" name="pickupLocation" placeholder="Enter pickup address" value={formData.pickupLocation} onChange={handleChange} required />
            )}
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipient's Address</label>
            {isLoaded ? (
              <Autocomplete onLoad={(autoC) => dropoffAutocompleteRef.current = autoC} onPlaceChanged={onDropoffPlaceChanged}>
                <input type="text" className="input-field" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, paddingLeft: 0, paddingRight: 0 }} name="dropoffLocation" placeholder="Search delivery address" value={formData.dropoffLocation} onChange={handleChange} required />
              </Autocomplete>
            ) : (
              <input type="text" className="input-field" name="dropoffLocation" placeholder="Enter delivery address" value={formData.dropoffLocation} onChange={handleChange} required />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1 }}>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Receiver's Name</label>
            <input type="text" className="input-field" name="receiverName" placeholder="Jane Doe" value={formData.receiverName} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact</label>
            <input type="text" className="input-field" name="receiverContact" placeholder="+1234567890" value={formData.receiverContact} onChange={handleChange} required />
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label className="input-label" style={{ fontSize: '0.875rem', marginBottom: 0, color: '#fff' }}>Choose Package Type</label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
            {packageTypes.map(pkg => (
              <div 
                key={pkg.id} 
                onClick={() => handlePackageSelect(pkg.id)}
                style={{ 
                  flex: '0 0 auto', 
                  width: '100px', 
                  height: '110px', 
                  background: formData.packageDescription === pkg.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)', 
                  border: formData.packageDescription === pkg.id ? '1px dashed #fff' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{pkg.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: formData.packageDescription === pkg.id ? '#fff' : 'var(--text-muted)' }}>{pkg.name}</div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '2rem', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
          {loading ? 'Processing...' : 'Send Package'}
        </button>
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
                polylineOptions: { strokeColor: '#D24A3D', strokeWeight: 4 },
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
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
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
          <div>
            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost</div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#D24A3D' }}>GH₵{priceEstimate.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );

  return <AppLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default CreateOrder;
