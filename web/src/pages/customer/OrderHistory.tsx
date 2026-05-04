import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLoadScript, GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import AppLayout from '../../components/AppLayout';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  receiverName: string;
  receiverContact: string;
  packageDescription?: string;
  status: string;
  price: number;
  createdAt: string;
  rider?: {
    name: string;
    phone: string;
  } | null;
}

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

const OrderHistory: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders);
        if (res.data.orders.length > 0) {
          setSelectedOrder(res.data.orders[0]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        toast.error('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDirections(null); // Reset directions to trigger new fetch
  };

  const directionsCallback = (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (status === 'OK' && result) {
      setDirections(result);
    } else {
      console.error(`error fetching directions ${result}`);
    }
  };

  const leftContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: '0.8rem', color: '#fff' }}>Delivery History</h2>

      {loading ? (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>Loading history...</div>
      ) : orders.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
          <h3 className="text-muted" style={{ fontSize: '0.875rem' }}>You have no delivery requests yet.</h3>
        </div>
      ) : (
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => handleOrderClick(order)}
              style={{ 
                background: selectedOrder?.id === order.id ? '#3d1c36' : 'var(--bg-sidebar)', 
                border: selectedOrder?.id === order.id ? '1px solid var(--primary)' : '1px solid #3d1c36', 
                borderRadius: '1rem', 
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className={`badge badge-${order.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{order.status}</span>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>GH₵{order.price.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', marginTop: '4px', flexShrink: 0 }}></div>
                  <div>
                    <p className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.1rem' }}>From</p>
                    <p style={{ fontWeight: 500, fontSize: '0.8rem', color: '#fff', lineHeight: 1.4 }}>{order.pickupLocation}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px', flexShrink: 0 }}></div>
                  <div>
                    <p className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.1rem' }}>To</p>
                    <p style={{ fontWeight: 500, fontSize: '0.8rem', color: '#fff', lineHeight: 1.4 }}>{order.dropoffLocation}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #3d1c36', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>person</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.receiverName}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              {selectedOrder?.id === order.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #3d1c36', animation: 'fade-in-top 0.3s ease' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Package Description</p>
                    <p style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.5 }}>{order.packageDescription || 'No description provided.'}</p>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Receiver Contact</p>
                    <p style={{ fontSize: '0.85rem', color: '#fff' }}>{order.receiverContact}</p>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Delivery Assignment</p>
                    {order.rider ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#fff' }}><strong>{order.rider.name}</strong> has been assigned to this delivery.</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>call</span> 
                          <a href={`tel:${order.rider.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{order.rider.phone}</a>
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waiting for a delivery rider to accept the order.</p>
                    )}
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Status</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fff' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>
                        {order.status === 'PENDING' ? 'schedule' : 
                         order.status === 'ASSIGNED' ? 'directions_bike' : 
                         order.status === 'PICKED_UP' ? 'local_shipping' : 
                         order.status === 'DELIVERED' ? 'check_circle' : 'cancel'}
                      </span>
                      <span>
                        {order.status === 'PENDING' && 'Order is placed and pending rider assignment.'}
                        {order.status === 'ASSIGNED' && 'Rider is on the way to pick up the package.'}
                        {order.status === 'PICKED_UP' && 'Package has been picked up and is in transit.'}
                        {order.status === 'DELIVERED' && 'Package has been successfully delivered!'}
                        {order.status === 'CANCELLED' && 'This order was cancelled.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
          {selectedOrder && !directions && (
            <DirectionsService
              options={{
                destination: selectedOrder.dropoffLocation,
                origin: selectedOrder.pickupLocation,
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

      {selectedOrder && (
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffffff',
          padding: '1rem 2rem',
          borderRadius: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          color: '#111',
          zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>#{selectedOrder.id.slice(-6).toUpperCase()}</div>
          </div>
          <div style={{ width: '1px', height: '20px', background: '#ddd' }}></div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)' }}>{selectedOrder.status}</div>
          </div>
        </div>
      )}
    </div>
  );

  return <AppLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default OrderHistory;
