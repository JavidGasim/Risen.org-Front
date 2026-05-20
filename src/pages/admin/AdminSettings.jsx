import { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Save, Key, Loader2, CheckCircle2, AlertCircle, 
  Settings as SettingsIcon, ShieldCheck, Globe, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminSettings() {
  const { user, refreshStats } = useAuth();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('account');

  // Profile Info State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  // Password State
  const [passwords, setPasswords] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load initial data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put('/Me', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await refreshStats();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const [resetStep, setResetStep] = useState(1); // 1: Request, 2: Reset

  const handleRequestToken = async () => {
    setPassLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/Auth/forgot-password', { email: profileData.email });
      setMessage({ type: 'success', text: 'Reset token sent to your email!' });
      setResetStep(2);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to request reset token.' 
      });
    } finally {
      setPassLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setPassLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/Auth/reset-password', {
        email: profileData.email,
        token: passwords.token,
        newPassword: passwords.newPassword
      });
      
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setPasswords({ token: '', newPassword: '', confirmPassword: '' });
      setResetStep(1);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to reset password.' 
      });
    } finally {
      setPassLoading(false);
    }
  };

  const tabs = [
    { id: 'account', name: 'Account Settings', icon: User },
    { id: 'security', name: 'Security', icon: ShieldCheck },
    { id: 'system', name: 'System Config', icon: SettingsIcon },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="admin-page fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
          Admin <span className="text-gradient">Settings</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage your administrative account and platform configuration.</p>
      </header>

      {message.text && (
        <div className="slide-up" style={{ 
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: message.type === 'success' ? '#10B981' : '#FCA5A5',
          padding: '16px 24px', borderRadius: '12px', marginBottom: '32px',
          display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="admin-settings-layout" style={{ display: 'flex', gap: '32px' }}>
        {/* Tabs Sidebar */}
        <div className="admin-settings-tabs" style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: activeTab === tab.id ? '600' : '500',
                textAlign: 'left',
                border: activeTab === tab.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
              }}
            >
              <tab.icon size={18} color={activeTab === tab.id ? 'var(--primary)' : 'currentColor'} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'account' && (
            <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={24} color="var(--primary)" /> Profile Information
                </h2>
                
                <form onSubmit={handleProfileUpdate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input 
                        type="text" className="form-control" 
                        value={profileData.firstName} 
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input 
                        type="text" className="form-control" 
                        value={profileData.lastName} 
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="email" className="form-control" 
                        value={profileData.email} 
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required
                      />
                      <Mail size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                      Note: Changing your email will update your login credentials.
                    </p>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Profile Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={24} color="#F59E0B" /> Password Reset
                </h2>
                
                {resetStep === 1 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
                      To change your password, you must first request a reset token which will be sent to <strong>{profileData.email}</strong>.
                    </p>
                    <button 
                      onClick={handleRequestToken} 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      disabled={passLoading}
                    >
                      {passLoading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                      Request Reset Token
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordReset}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">Reset Token (from Email)</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" className="form-control" 
                          placeholder="Enter the token received in your email"
                          value={passwords.token}
                          onChange={(e) => setPasswords({...passwords, token: e.target.value})}
                          required
                        />
                        <Key size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input 
                          type="password" className="form-control" 
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input 
                          type="password" className="form-control" 
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        type="button" 
                        onClick={() => setResetStep(1)} 
                        className="btn btn-outline" 
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ flex: 2 }} 
                        disabled={passLoading}
                      >
                        {passLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Complete Reset
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="premium-card" style={{ padding: '24px', borderStyle: 'dashed' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px' }}>
                    <Bell size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: 'white' }}>Two-Factor Authentication</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                      Add an extra layer of security to your admin account. (Coming Soon)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="tab-content">
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                <SettingsIcon size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '20px' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>System Configuration</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
                  Global platform settings and maintenance controls.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                      <span style={{ fontWeight: '500' }}>Maintenance Mode</span>
                      <div style={{ width: '40px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative', cursor: 'not-allowed' }}>
                        <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                      <span style={{ fontWeight: '500' }}>Public Registration</span>
                      <div style={{ width: '40px', height: '20px', background: 'var(--primary)', borderRadius: '10px', position: 'relative', cursor: 'not-allowed' }}>
                        <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                      </div>
                   </div>
                </div>
                
                <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                   <p style={{ fontSize: '14px', color: 'var(--primary)', margin: 0, fontWeight: '500' }}>
                     Advanced system settings are restricted to Super Admins.
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
