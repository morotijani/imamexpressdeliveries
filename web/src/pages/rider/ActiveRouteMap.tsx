import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoadScript, GoogleMap, DirectionsService, DirectionsRenderer, Marker, Polyline } from '@react-google-maps/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
  position: 'absolute' as 'absolute',
  top: 0,
  left: 0,
  zIndex: 1
};

const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Accra default

const mapOptions = {
  styles: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] }, { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] }, { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] }, { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }, { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] }, { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }],
  disableDefaultUI: true,
  zoomControl: true,
};

const ActiveRouteMap: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<any>(location.state?.order);

  const [riderLocation, setRiderLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<{ text: string, duration: string } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hasFitBounds, setHasFitBounds] = useState(false);

  // Status Update & PIN Modal State
  const [updating, setUpdating] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    if (!currentOrder) {
      toast.error('No order selected for tracking');
      navigate('/rider/deliveries');
      return;
    }

    // Start watching Rider's Location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setRiderLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error watching position", error);
          if (error.code === error.PERMISSION_DENIED) {
            toast.error("Location access denied. Cannot track route live.");
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  }, [currentOrder, navigate]);

  const directionsCallback = useCallback((result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (status === 'OK' && result) {
      setDirections(result);

      // Calculate total distance and time
      let totalDistance = 0;
      let totalDuration = 0;
      const route = result.routes[0];

      if (route && route.legs) {
        for (let i = 0; i < route.legs.length; i++) {
          totalDistance += route.legs[i].distance?.value || 0;
          totalDuration += route.legs[i].duration?.value || 0;
        }
      }

      setDistanceInfo(prev => ({
        ...prev,
        text: (totalDistance / 1000).toFixed(1) + ' km (Route)',
        duration: Math.ceil(totalDuration / 60) + ' min'
      }));
    } else {
      console.error(`Error fetching main directions: ${status}`);
    }
  }, []);

  useEffect(() => {
    if (map && directions && !hasFitBounds) {
      const bounds = new window.google.maps.LatLngBounds();

      // Add route bounds
      if (directions.routes[0] && directions.routes[0].bounds) {
        bounds.union(directions.routes[0].bounds);
      }

      // Add rider location if available and assigned
      if (riderLocation && currentOrder?.status === 'ASSIGNED') {
        bounds.extend(riderLocation);
      }

      map.fitBounds(bounds);

      // Add padding to bounds
      const padding = { top: 100, right: 50, bottom: 250, left: 50 };
      map.fitBounds(bounds, padding);

      setHasFitBounds(true);
    }
  }, [map, directions, riderLocation, hasFitBounds, currentOrder?.status]);

  const handleRecenter = () => {
    if (map && riderLocation) {
      map.panTo(riderLocation);
      map.setZoom(16);
    } else if (!riderLocation) {
      toast.error('Getting your current location...');
    }
  };

  const handleStatusUpdate = async (newStatus: string, pin?: string) => {
    if (!currentOrder) return;
    setUpdating(true);
    setPinError('');
    try {
      await axios.patch(`http://localhost:5000/api/rider/orders/${currentOrder.id}/status`,
        { status: newStatus, pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setCurrentOrder({ ...currentOrder, status: newStatus });
      toast.success(`Order marked as ${newStatus}`);

      if (newStatus === 'DELIVERED') {
        setIsPinModalOpen(false);
        setPinInput('');
      }
    } catch (err: any) {
      if (newStatus === 'DELIVERED') {
        setPinError(err.response?.data?.message || 'Invalid PIN');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setUpdating(false);
    }
  };

  const initiateDelivery = () => {
    setIsPinModalOpen(true);
    setPinInput('');
    setPinError('');
  };

  const confirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    handleStatusUpdate('DELIVERED', pinInput);
  };

  if (loadError) return <div style={{ color: 'var(--text-main)', padding: '2rem', textAlign: 'center', background: 'var(--bg-base)', height: '100vh' }}>Error loading maps</div>;
  if (!isLoaded) return <div style={{ color: 'var(--text-main)', padding: '2rem', textAlign: 'center', background: 'var(--bg-base)', height: '100vh' }}>Loading Map...</div>;
  if (!currentOrder) return null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* Floating Header */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 10,
        padding: '1rem',
        background: 'var(--nav-bg)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-main)', cursor: 'pointer'
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Active Route</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary-light)' }}>Order #{currentOrder.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={riderLocation || defaultCenter}
        zoom={14}
        options={mapOptions}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {/* Directions Request - Always draw Pickup to Dropoff instantly */}
        {currentOrder && !directions && (
          <DirectionsService
            options={{
              origin: currentOrder.pickupLocation,
              destination: currentOrder.dropoffLocation,
              travelMode: google.maps.TravelMode.DRIVING
            }}
            callback={directionsCallback}
          />
        )}

        {/* Directions Renderer - Main Route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: { strokeColor: '#A020F0', strokeWeight: 5 },
              suppressMarkers: false,
            }}
          />
        )}

        {/* Polyline - Rider to Pickup (Straight yellow dashed line) */}
        {currentOrder && currentOrder.status === 'ASSIGNED' && riderLocation && directions && directions.routes[0] && (
          <Polyline
            path={[riderLocation, directions.routes[0].legs[0].start_location]}
            options={{
              strokeColor: '#eab308',
              strokeOpacity: 0,
              strokeWeight: 3,
              icons: [{
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                offset: '0',
                repeat: '15px'
              }]
            }}
          />
        )}

        {/* Current Location Marker - Live Tracking independent of route */}
        {riderLocation && (
          <Marker
            position={riderLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/kml/shapes/motorcycling.png',
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            }}
            zIndex={100}
          />
        )}
      </GoogleMap>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        style={{
          position: 'absolute',
          bottom: '180px', // Right above the bottom card
          right: '1rem',
          zIndex: 20,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'var(--primary)',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>my_location</span>
      </button>

      {/* Floating Info Bottom Card */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        zIndex: 10,
        background: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border-color)',
        borderTopLeftRadius: '1.5rem',
        borderTopRightRadius: '1.5rem',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
              {distanceInfo ? distanceInfo.duration : 'Calculating...'}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {distanceInfo ? distanceInfo.text : ''} remaining
            </p>
          </div>
          <span className={`badge badge-${currentOrder.status.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
            {currentOrder.status}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {currentOrder.status === 'ASSIGNED' && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#eab308' }}>trip_origin</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Stop: Pickup</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentOrder.pickupLocation}</p>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: '#22c55e' }}>location_on</span>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Final Stop: Dropoff</p>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentOrder.dropoffLocation}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons for Updating Status */}
        <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          {currentOrder.status === 'ASSIGNED' && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontSize: '0.95rem', fontWeight: 700, opacity: updating ? 0.7 : 1 }}
              onClick={() => handleStatusUpdate('PICKED_UP')}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Confirm Pickup'}
            </button>
          )}
          {currentOrder.status === 'PICKED_UP' && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', opacity: updating ? 0.7 : 1 }}
              onClick={() => initiateDelivery()}
              disabled={updating}
            >
              Confirm Drop Off
            </button>
          )}
          {currentOrder.status === 'DELIVERED' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '1rem', color: '#22c55e', fontWeight: 700 }}>
              <span className="material-symbols-outlined">verified</span>
              Delivery Complete
            </div>
          )}
        </div>
      </div>

      {/* PIN Verification Modal */}
      <AnimatePresence>
        {isPinModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(5px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '1.5rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '400px',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setIsPinModalOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary-light)', marginBottom: '0.5rem' }}>lock</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Verify Delivery</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ask the receiver for their 4-digit order PIN to complete this delivery.</p>
              </div>

              <form onSubmit={confirmDelivery}>
                <input
                  type="text"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 4-digit PIN"
                  style={{
                    width: '100%',
                    background: 'var(--bg-darker)',
                    border: '2px solid var(--border-color)',
                    borderRadius: '1rem',
                    padding: '1rem',
                    fontSize: '1.25rem',
                    letterSpacing: pinInput.length > 0 ? '0.5rem' : 'normal',
                    textAlign: 'center',
                    color: 'var(--text-main)',
                    fontFamily: 'Outfit, sans-serif',
                    outline: 'none',
                    marginBottom: '1rem',
                    fontWeight: 800
                  }}
                  autoFocus
                />

                {pinError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>{pinError}</p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 700 }}
                  disabled={updating || pinInput.length !== 4}
                >
                  {updating ? 'Verifying...' : 'Confirm Delivery'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ActiveRouteMap;
