import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
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

const Profile: React.FC = () => {
  const { token, user: authUser, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
    homeAddress: '',
    workAddress: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeAddressField, setActiveAddressField] = useState<'homeAddress' | 'workAddress' | null>(null);

  const homeAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const workAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onHomePlaceChanged = () => {
    if (homeAutocompleteRef.current) {
      const place = homeAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({ ...prev, homeAddress: place.formatted_address! }));
      } else if (place.name) {
        setFormData(prev => ({ ...prev, homeAddress: place.name || '' }));
      }
    }
  };

  const onWorkPlaceChanged = () => {
    if (workAutocompleteRef.current) {
      const place = workAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({ ...prev, workAddress: place.formatted_address! }));
      } else if (place.name) {
        setFormData(prev => ({ ...prev, workAddress: place.name || '' }));
      }
    }
  };

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!activeAddressField || !e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setUserLocation({ lat, lng });

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        setFormData(prev => ({ ...prev, [activeAddressField]: results[0].formatted_address }));
        toast.success(`${activeAddressField === 'homeAddress' ? 'Home' : 'Work'} address pinned!`);
      } else {
        toast.error('Could not find address for this location.');
      }
    });
  };

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
        }
      );
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { name, email, phone, profileImage, homeAddress, workAddress } = res.data.user;
        setFormData({ name, email, phone: phone || '', profileImage: profileImage || '', homeAddress: homeAddress || '', workAddress: workAddress || '' });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formPayload = new FormData();
      formPayload.append('profileImage', file);
      
      const uploadPromise = axios.post('http://localhost:5000/api/user/upload-profile-image', 
        formPayload, 
        { headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      toast.promise(uploadPromise, {
        loading: 'Uploading profile picture...',
        success: (res) => {
          setFormData({ ...formData, profileImage: res.data.user.profileImage });
          if (authUser) {
            login(res.data.user, token!);
          }
          return 'Profile picture updated successfully!';
        },
        error: (err) => err.response?.data?.message || 'Failed to upload profile picture.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatePromise = axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.promise(updatePromise, {
        loading: 'Saving profile changes...',
        success: (res) => {
          if (authUser) {
            login(res.data.user, token!);
          }
          return 'Profile updated successfully!';
        },
        error: (err) => err.response?.data?.message || 'Failed to update profile.'
      });
    } catch (err: any) {
      // toast.promise handles the error but we still catch to stop loading state
    } finally {
      setSaving(false);
    }
  };

  const leftContent = (
    <div style={{ position: 'relative' }}>
      <h2 style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        background: 'var(--bg-sidebar)', 
        paddingTop: '1.5rem', 
        paddingBottom: '1rem', 
        marginTop: 0, 
        marginBottom: '1.5rem', 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        color: 'var(--text-main)',
        borderBottom: '1px solid rgba(160, 32, 240, 0.1)'
      }}>
        My Profile
      </h2>
      
      {loading ? (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>Loading details...</div>
      ) : (
        <div>
          {/* Profile Picture Section */}
          <div style={{ position: 'relative', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: formData.profileImage ? `url(${formData.profileImage.startsWith('data:') || formData.profileImage.startsWith('http') ? formData.profileImage : `http://localhost:5000${formData.profileImage}`}) center/cover` : 'var(--primary)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: '#fff',
              overflow: 'hidden',
              border: '4px solid var(--bg-sidebar)'
            }}>
              {!formData.profileImage && (formData.name.charAt(0).toUpperCase() || 'U')}
            </div>
            <button 
              type="button"
              onClick={handleFileClick}
              style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: 'calc(50% - 50px)', 
                background: 'var(--bg-surface)', 
                color: 'var(--text-main)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>photo_camera</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Full Name</label>
              <input
                type="text"
                className="input-field"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Email Address</label>
              <input
                type="email"
                className="input-field"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Phone Number</label>
              <input
                type="text"
                className="input-field"
                name="phone"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Home Address</label>
              {isLoaded ? (
                <Autocomplete onLoad={(autoC) => homeAutocompleteRef.current = autoC} onPlaceChanged={onHomePlaceChanged}>
                  <input
                    type="text"
                    className="input-field"
                    name="homeAddress"
                    placeholder="123 Main St, Apartment 4B"
                    value={formData.homeAddress}
                    onChange={handleChange}
                    onFocus={() => setActiveAddressField('homeAddress')}
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  name="homeAddress"
                  placeholder="123 Main St, Apartment 4B"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  onFocus={() => setActiveAddressField('homeAddress')}
                />
              )}
            </div>

            <div className="input-group">
              <label className="input-label" style={{ color: 'var(--text-main)' }}>Work Address</label>
              {isLoaded ? (
                <Autocomplete onLoad={(autoC) => workAutocompleteRef.current = autoC} onPlaceChanged={onWorkPlaceChanged}>
                  <input
                    type="text"
                    className="input-field"
                    name="workAddress"
                    placeholder="456 Corporate Blvd, Suite 100"
                    value={formData.workAddress}
                    onChange={handleChange}
                    onFocus={() => setActiveAddressField('workAddress')}
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  name="workAddress"
                  placeholder="456 Corporate Blvd, Suite 100"
                  value={formData.workAddress}
                  onChange={handleChange}
                  onFocus={() => setActiveAddressField('workAddress')}
                />
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', borderRadius: '2rem', padding: '1rem' }}
              disabled={saving}
            >
              {saving ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </form>

          {/* Account Details Section */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: 'var(--bg-darker)', padding: '1rem', borderRadius: '1rem' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Account Status</p>
                <p style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>Verified & Active</p>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-darker)', padding: '1rem', borderRadius: '1rem' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Member Since</p>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const rightContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {activeAddressField && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary)',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '2rem',
          zIndex: 10,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          pointerEvents: 'none'
        }}>
          <span className="material-symbols-outlined">location_on</span>
          Click on the map to set your {activeAddressField === 'homeAddress' ? 'Home' : 'Work'} address
        </div>
      )}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={14}
          options={{ ...mapOptions, draggableCursor: activeAddressField ? 'crosshair' : 'grab' }}
          onClick={onMapClick}
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

  return <AppLayout leftContent={leftContent} rightContent={rightContent} mobileLayout="full-left" />;
};

export default Profile;
