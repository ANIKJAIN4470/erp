import { useState, useEffect } from 'react';
import { 
  User, Building, Shield, Loader2, 
  Save, LogOut, CreditCard, Smartphone, Zap
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  async function fetchUserData() {
    try {
      setLoading(true);
      const data = await api.get('/auth/me/');
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Personal Identity', icon: User },
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
  ];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Enterprise Settings</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Configure your personal preferences and organization-wide security protocols.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem' }}>
        {/* Sidebar Nav */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.75rem 1rem' }}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
          <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border-subtle)' }}></div>
          <button onClick={logout} className="nav-link" style={{ border: 'none', color: 'var(--error)', background: 'transparent' }}>
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </aside>

        {/* Content Area */}
        <div style={{ maxWidth: '800px' }}>
          {activeTab === 'profile' && (
            <div className="animate-slide-up">
              <div className="card-premium" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.25rem' }}>{user?.username}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Full Stack Architect • {user?.role.toUpperCase()}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Display Name</label>
                    <input type="text" defaultValue={user?.username} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Contact Email</label>
                    <input type="email" defaultValue={user?.email} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Bio / Description</label>
                    <textarea rows="3" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', color: 'var(--text-main)', resize: 'vertical' }} placeholder="Tell us about your role..."></textarea>
                  </div>
                </div>

                <button className="nav-link active" style={{ marginTop: '2rem', border: 'none', padding: '0.75rem 1.5rem' }}>
                  <Save size={16} /> <span>Persist Changes</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="animate-slide-up">
              <div className="card-premium" style={{ padding: '2rem' }}>
                <span className="profile-section-label">Enterprise Identity</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="profile-field">
                    <span className="profile-field-label">Organization Name</span>
                    <span className="profile-field-value">{user?.company_name || 'CloudERP Global'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Primary Region</span>
                    <span className="profile-field-value">Mumbai (ap-south-1)</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Tenant ID</span>
                    <span className="profile-field-value" style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary)' }}>#4044-6806-0107</span>
                  </div>
                </div>

                <div className="card-premium" style={{ marginTop: '2.5rem', borderStyle: 'dashed', background: 'rgba(59, 130, 246, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                  <Zap size={24} color="var(--primary)" />
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>Enterprise Plan</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Your organization is currently on the high-frequency trading tier.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-slide-up">
              <div className="card-premium" style={{ padding: '2rem' }}>
                <span className="profile-section-label">Access Protection</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Two-Factor Authentication</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Add an extra layer of security to your session.</p>
                    </div>
                    <button className="nav-link active" style={{ border: 'none', fontSize: '0.7rem' }}>Enable MFA</button>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)' }}></div>
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '1rem' }}>Active Sessions</h4>
                    <div className="profile-field" style={{ opacity: 0.6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Smartphone size={16} />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>iPhone 15 Pro</div>
                          <div style={{ fontSize: '0.65rem' }}>Mumbai, IN • Just now</div>
                        </div>
                      </div>
                      <span className="risk-tag" style={{ fontSize: '0.6rem' }}>CURRENT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
