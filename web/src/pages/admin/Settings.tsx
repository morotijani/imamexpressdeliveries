import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface PricingConfig {
  baseRate: number;
  perKmRate: number;
  expressMultiplier: number;
  documentMultiplier: number;
  foodMultiplier: number;
  electronicsMultiplier: number;
  fragileMultiplier: number;
  otherMultiplier: number;
}

interface SystemStatus {
  dbStatus: 'online' | 'offline';
  emailStatus: 'online' | 'offline';
  internetStatus: 'online' | 'offline';
}

const Settings: React.FC = () => {
  const { token } = useAuth();
  const [pricing, setPricing] = useState<PricingConfig>({ 
    baseRate: 0, perKmRate: 0, expressMultiplier: 0,
    documentMultiplier: 1.0, foodMultiplier: 1.2, electronicsMultiplier: 1.5, fragileMultiplier: 1.8, otherMultiplier: 1.0
  });
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, statusRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/pricing', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/system-status', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setPricing(pricingRes.data.pricing);
        setStatus(statusRes.data);
      } catch (err) {
        console.error('Failed to fetch settings/status:', err);
        toast.error('Failed to load system data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch('http://localhost:5000/api/admin/pricing', pricing, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Pricing model updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '50vh' }}><div className="loader"></div></div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure global system parameters and pricing models</p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Pricing Configuration Card */}
        <div className="admin-glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '12px', background: 'rgba(160, 32, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(160, 32, 240, 0.3)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>payments</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>Delivery Pricing Model</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Adjust how delivery fees are calculated for customers</p>
            </div>
          </div>

          <form onSubmit={handlePricingSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base Rate (GH₵)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  required 
                  className="input-field" 
                  value={pricing.baseRate} 
                  onChange={e => setPricing({...pricing, baseRate: Math.max(0, parseFloat(e.target.value) || 0)})} 
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Starting fee for every order</p>
              </div>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Per KM Rate (GH₵)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  required 
                  className="input-field" 
                  value={pricing.perKmRate} 
                  onChange={e => setPricing({...pricing, perKmRate: Math.max(0, parseFloat(e.target.value) || 0)})} 
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Added fee for each kilometer traveled</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Express Multiplier</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  required 
                  className="input-field" 
                  value={pricing.expressMultiplier} 
                  onChange={e => setPricing({...pricing, expressMultiplier: Math.max(0, parseFloat(e.target.value) || 0)})} 
                />
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem', marginTop: '0.5rem' }}>Package Type Multipliers</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documents</label>
                <input type="number" step="0.1" min="0" required className="input-field" value={pricing.documentMultiplier} onChange={e => setPricing({...pricing, documentMultiplier: Math.max(0, parseFloat(e.target.value) || 0)})} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Food</label>
                <input type="number" step="0.1" min="0" required className="input-field" value={pricing.foodMultiplier} onChange={e => setPricing({...pricing, foodMultiplier: Math.max(0, parseFloat(e.target.value) || 0)})} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Electronics</label>
                <input type="number" step="0.1" min="0" required className="input-field" value={pricing.electronicsMultiplier} onChange={e => setPricing({...pricing, electronicsMultiplier: Math.max(0, parseFloat(e.target.value) || 0)})} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fragile</label>
                <input type="number" step="0.1" min="0" required className="input-field" value={pricing.fragileMultiplier} onChange={e => setPricing({...pricing, fragileMultiplier: Math.max(0, parseFloat(e.target.value) || 0)})} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clothing / Other</label>
                <input type="number" step="0.1" min="0" required className="input-field" value={pricing.otherMultiplier} onChange={e => setPricing({...pricing, otherMultiplier: Math.max(0, parseFloat(e.target.value) || 0)})} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary" 
              style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 2rem', fontSize: '0.9rem' }}
            >
              {saving ? 'Saving...' : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>save</span>
                  Save Pricing Model
                </>
              )}
            </button>
          </form>
        </div>

        {/* System Status Card */}
        <div className="admin-glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981' }}>analytics</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>System Status</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Real-time health check of core components</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-darker)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>database</span>
                <span style={{ color: 'var(--text-main)' }}>Database Engine</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status?.dbStatus === 'online' ? '#10b981' : '#ef4444' }}></div>
                <span style={{ color: status?.dbStatus === 'online' ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {status?.dbStatus || 'Checking...'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-darker)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>mail</span>
                <span style={{ color: 'var(--text-main)' }}>Email Server (SMTP)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status?.emailStatus === 'online' ? '#10b981' : '#ef4444' }}></div>
                <span style={{ color: status?.emailStatus === 'online' ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {status?.emailStatus || 'Checking...'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-darker)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>wifi</span>
                <span style={{ color: 'var(--text-main)' }}>Internet Connectivity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status?.internetStatus === 'online' ? '#10b981' : '#ef4444' }}></div>
                <span style={{ color: status?.internetStatus === 'online' ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {status?.internetStatus || 'Checking...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Settings (Conceptual for now) */}
        <div className="admin-glass-card" style={{ padding: '2rem', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '12px', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>notifications_active</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', margin: 0 }}>Notification Settings</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Configure SMS and Email alerts (Coming Soon)</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
