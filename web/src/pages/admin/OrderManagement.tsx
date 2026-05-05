import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useLoadScript, GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

interface Order {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  receiverName: string;
  receiverContact: string;
  packageDescription: string;
  status: string;
  price: number;
  distance: number;
  createdAt: string;
  customer: { name: string, email: string };
  rider: { name: string, phone: string } | null;
}

interface Rider {
  id: string;
  name: string;
  phone: string;
}

const mapContainerStyle = { width: '100%', height: '200px', borderRadius: '1rem', marginBottom: '1.5rem' };
const defaultCenter = { lat: 5.6037, lng: -0.1870 }; // Accra default

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [{ elementType: "geometry", stylers: [{ color: "#2b1426" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#a78bfa" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#1e0e1a" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#3d1c36" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e0e1a" }] }]
};

const QuickActionMenu = ({ order, onView, onAssign }: { order: Order, onView: () => void, onAssign: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="nav-item-hover"
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setOpen(false); }}></div>
          <div style={{ position: 'absolute', right: 0, top: '100%', background: '#1e0e1a', border: '1px solid rgba(160,32,240,0.2)', borderRadius: '0.5rem', padding: '0.5rem', zIndex: 100, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpen(false); onView(); }}
              style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '0.5rem', color: '#fff', cursor: 'pointer', borderRadius: '0.25rem', fontSize: '0.85rem' }}
              className="nav-item-hover"
            >
              View Details
            </button>
            {(order.status === 'PENDING' || order.status === 'ASSIGNED') && (
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); onAssign(); }}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '0.5rem', color: '#fff', cursor: 'pointer', borderRadius: '0.25rem', fontSize: '0.85rem' }}
                className="nav-item-hover"
              >
                Assign Rider
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const OrderManagement: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [assigning, setAssigning] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    setDirections(null);
  }, [selectedOrder]);

  const directionsCallback = (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (status === 'OK' && result) {
      setDirections(result);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/riders', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setOrders(ordersRes.data.orders);
      setRiders(ridersRes.data.riders);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    if (!riderId) return;
    setAssigning(true);
    try {
      await axios.post('http://localhost:5000/api/admin/orders/assign', 
        { orderId, riderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Rider assigned successfully');
      fetchData(); // Refresh list to get updated order
    } catch (err) {
      toast.error('Failed to assign rider');
    } finally {
      setAssigning(false);
    }
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loader"></div></div>;

  return (
    <div style={{ paddingBottom: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Order Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track, assign, and manage all deliveries</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
        {['ALL', 'PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED'].map(status => (
          <button 
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{ 
              background: filterStatus === status ? 'var(--primary)' : 'transparent',
              color: filterStatus === status ? '#fff' : 'var(--text-muted)',
              border: filterStatus === status ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
              padding: '0.5rem 1.25rem',
              borderRadius: '2rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {status.replace('_', ' ')}
            <span style={{ 
              background: filterStatus === status ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', 
              padding: '2px 6px', 
              borderRadius: '10px', 
              marginLeft: '8px',
              fontSize: '0.7rem'
            }}>
              {status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Main Data Grid */}
        <div className="admin-glass-card" style={{ flex: selectedOrder ? 2 : 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'flex 0.3s ease' }}>
          <div style={{ overflowY: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>ID / Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Route</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Rider</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="data-table-row" 
                    style={{ 
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      background: selectedOrder?.id === order.id ? 'rgba(160, 32, 240, 0.1)' : 'transparent',
                      borderLeft: selectedOrder?.id === order.id ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                  >
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>#{order.id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }}></div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{order.pickupLocation}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{order.dropoffLocation}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {order.rider ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {order.rider.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: '0.85rem' }}>{order.rider.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right', fontSize: '0.9rem' }}>
                      GH₵{order.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <QuickActionMenu 
                          order={order} 
                          onView={() => setSelectedOrder(order)} 
                          onAssign={() => { setSelectedOrder(order); setTimeout(() => { document.getElementById('assignment-box')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} 
                        />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found for this status.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Side Panel */}
        {selectedOrder && (
          <div className="admin-glass-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', animation: 'fade-in-right 0.3s ease', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Order Details</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>#{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
              
              {/* Mini Map */}
              {isLoaded && (
                <div style={{ border: '1px solid rgba(160, 32, 240, 0.2)', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={defaultCenter}
                    zoom={12}
                    options={mapOptions}
                  >
                    {!directions && (
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
                          polylineOptions: { strokeColor: '#A020F0', strokeWeight: 5 },
                          suppressMarkers: false,
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
              )}

              {/* Assignment Box */}
              <div id="assignment-box" style={{ background: 'rgba(160, 32, 240, 0.05)', border: '1px solid rgba(160, 32, 240, 0.2)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Rider Assignment</h4>
                {selectedOrder.status === 'PENDING' || selectedOrder.status === 'ASSIGNED' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <select 
                      className="input-field" 
                      style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', opacity: assigning ? 0.5 : 1 }}
                      value={selectedOrder.rider?.id || ""}
                      onChange={(e) => handleAssignRider(selectedOrder.id, e.target.value)}
                      disabled={assigning}
                    >
                      <option value="" disabled>Assign a Rider</option>
                      {riders.map(r => <option key={r.id} value={r.id} style={{ color: '#000' }}>{r.name} - {r.phone}</option>)}
                    </select>
                    {selectedOrder.rider && (
                      <p style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span>
                        Currently assigned to {selectedOrder.rider.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {selectedOrder.rider?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{selectedOrder.rider?.name || 'Unknown Rider'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrder.rider?.phone || 'No phone'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Details */}
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Route Details</h4>
              <div style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
                
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'absolute', left: '-1.5rem', top: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '3px solid var(--bg-dark)' }}></div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Pickup Location</p>
                  <p style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedOrder.pickupLocation}</p>
                  <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>person</span>
                    Customer: {selectedOrder.customer.name}
                  </p>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.5rem', top: '4px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid var(--bg-dark)' }}></div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Dropoff Location</p>
                  <p style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedOrder.dropoffLocation}</p>
                  <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>call</span>
                    Receiver: {selectedOrder.receiverName} ({selectedOrder.receiverContact})
                  </p>
                </div>
              </div>

              {/* Package Info */}
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Package & Billing</h4>
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</span>
                  <span style={{ fontSize: '0.85rem', color: '#fff', textAlign: 'right', maxWidth: '60%' }}>{selectedOrder.packageDescription || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Distance</span>
                  <span style={{ fontSize: '0.85rem', color: '#fff' }}>{selectedOrder.distance ? `${selectedOrder.distance.toFixed(1)} km` : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Price</span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--secondary)', fontWeight: 800 }}>GH₵{selectedOrder.price.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default OrderManagement;
