import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  status: string;
  riderId: string;
}

interface Rider {
  id: string;
  name: string;
  phone: string;
  status: string; // 'ONLINE' | 'IN_TRANSIT'
  location: { lat: number, lng: number };
}

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Accra default

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#2b1426" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a78bfa" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e0e1a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3d1c36" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e0e1a" }] }
];

const lightMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0e0e0" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }
];

// Base points for simulation
const simulationPoints = [
  { lat: 5.6137, lng: -0.1970 },
  { lat: 5.5937, lng: -0.1770 },
  { lat: 5.6237, lng: -0.1800 },
  { lat: 5.5800, lng: -0.2000 },
  { lat: 5.6300, lng: -0.1600 },
];

const FleetMonitoring: React.FC = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        const [ordersRes, ridersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/riders', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const activeOrders = ordersRes.data.orders.filter((o: Order) => o.status === 'PICKED_UP' || o.status === 'ASSIGNED');
        
        // Use actual backend status, fallback to simulation points for location if missing
        const mappedRiders = ridersRes.data.riders.map((rider: any, index: number) => {
          const location = rider.location || simulationPoints[index % simulationPoints.length];
          return {
            ...rider,
            status: rider.status || 'ONLINE',
            location
          };
        });

        setRiders(mappedRiders);
      } catch (err) {
        console.error('Error fetching fleet data:', err);
        toast.error('Failed to load fleet data');
      } finally {
        setLoading(false);
      }
    };

    fetchFleetData();
  }, [token]);

  if (!isLoaded || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loader"></div></div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
      
      {/* Background Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedRider ? selectedRider.location : defaultCenter}
        zoom={selectedRider ? 14 : 12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: theme === 'light' ? lightMapStyles : darkMapStyles
        }}
      >
        {riders.map(rider => (
          <Marker 
            key={rider.id} 
            position={rider.location} 
            icon={{
              url: rider.status === 'IN_TRANSIT' 
                ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' 
                : 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
            }}
            onClick={() => setSelectedRider(rider)}
          />
        ))}

        {selectedRider && (
          <InfoWindow
            position={selectedRider.location}
            onCloseClick={() => setSelectedRider(null)}
          >
            <div style={{ color: '#000', padding: '0.25rem' }}>
              <strong style={{ fontSize: '1rem', display: 'block' }}>{selectedRider.name}</strong>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '8px' }}>{selectedRider.phone}</span>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 'bold',
                color: '#fff', 
                background: selectedRider.status === 'IN_TRANSIT' ? '#10b981' : 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                {selectedRider.status.replace('_', ' ')}
              </span>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Floating Header */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, pointerEvents: 'none' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem', textShadow: theme === 'light' ? '0 1px 10px rgba(255,255,255,0.8)' : '0 2px 10px rgba(0,0,0,0.5)' }}>Fleet Monitoring</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textShadow: theme === 'light' ? '0 1px 5px rgba(255,255,255,0.8)' : '0 1px 5px rgba(0,0,0,0.5)' }}>Live Command Center</p>
      </div>

      {/* Rider Directory Panel */}
      <div style={{ 
        position: 'absolute', 
        top: '2rem', 
        right: '2rem', 
        bottom: '2rem', 
        width: '350px', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-color)',
        borderRadius: '1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        overflow: 'hidden'
      }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>two_wheeler</span>
            Active Fleet ({riders.length})
          </h3>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              In Transit ({riders.filter(r => r.status === 'IN_TRANSIT').length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
              Online ({riders.filter(r => r.status === 'ONLINE').length})
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="custom-scrollbar">
          {riders.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.9rem' }}>No riders available</div>
          ) : (
            riders.map(rider => (
              <div 
                key={rider.id}
                onClick={() => setSelectedRider(rider)}
                style={{ 
                  background: selectedRider?.id === rider.id ? 'var(--bg-darker)' : 'transparent',
                  border: selectedRider?.id === rider.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  padding: '1rem',
                  borderRadius: '1rem',
                  marginBottom: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                className="nav-item-hover"
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-darker)', color: 'var(--text-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {rider.name.charAt(0)}
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: rider.status === 'IN_TRANSIT' ? '#10b981' : 'var(--primary)',
                    border: '2px solid var(--bg-surface)'
                  }}></div>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{rider.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rider.phone}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};

export default FleetMonitoring;
