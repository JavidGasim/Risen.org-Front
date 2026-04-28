import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  User, Mail, School, ShieldCheck, 
  Save, Key, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { user, refreshStats } = useAuth();
  
  // Profile Info State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    universityId: '',
    universityName: ''
  });
  
  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [showUniDropdown, setShowUniDropdown] = useState(false);

  // Load initial data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        universityId: user.universityId || '',
        universityName: user.universityName || ''
      });
      setSearchQuery(user.universityName || '');
    }
  }, [user]);

  // University search logic
  useEffect(() => {
    const fetchUnis = async () => {
      if (searchQuery.trim().length < 2 || searchQuery === profileData.universityName) {
        setUniversities([]);
        setShowUniDropdown(false);
        return;
      }
      setLoadingUnis(true);
      try {
        const res = await api.get('/universities/search', {
          params: { q: searchQuery.trim(), limit: 50 }
        });
        const items = res.data?.items || res.data || [];
        setUniversities(items);
        setShowUniDropdown(true);
      } catch (e) {
        console.error('Failed to fetch universities', e);
      } finally {
        setLoadingUnis(false);
      }
    };

    const timer = setTimeout(fetchUnis, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, profileData.universityName]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put('/Me', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        universityId: profileData.universityId || null,
        universityName: profileData.universityName
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await refreshStats(); // Sync local user state
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setPassLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Assuming endpoint is /Auth/change-password based on standard patterns
      await api.post('/Auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to change password. Please verify your current password.' 
      });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Account <span className="text-gradient">Settings</span></h1>
        <p style={{ color: '#94A3B8' }}>Manage your personal information and security preferences.</p>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        {/* Profile Details */}
        <div className="premium-card slide-up" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <User size={24} color="#6366F1" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Personal Information</h2>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" className="form-control" 
                  value={user?.email || ''} 
                  disabled 
                  style={{ background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: '#64748B' }}
                />
                <Mail size={16} color="#475569" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', display: 'block' }}>Email address cannot be changed.</span>
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">University / Institution</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" className="form-control" 
                  placeholder="Search university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <School size={16} color="#475569" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                
                {loadingUnis && (
                  <div style={{ position: 'absolute', right: '45px', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={14} color="#6366F1" className="animate-spin" />
                  </div>
                )}
              </div>

              {showUniDropdown && universities.length > 0 && (
                <div style={{ 
                  position: 'absolute', zIndex: 10, width: '100%', marginTop: '4px',
                  background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                  {universities.map(uni => (
                    <div 
                      key={uni.id}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onClick={() => {
                        setProfileData({...profileData, universityId: uni.id, universityName: uni.name});
                        setSearchQuery(uni.name);
                        setShowUniDropdown(false);
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.95rem' }}>{uni.name}</div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem' }}>{uni.country}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-success" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="premium-card slide-up" style={{ padding: '32px', animationDelay: '100ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <ShieldCheck size={24} color="#F59E0B" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Security & Password</h2>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" className="form-control" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  required
                />
                <Key size={16} color="#475569" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">New Password</label>
              <input 
                type="password" className="form-control" 
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                required
                minLength={8}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" className="form-control" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={passLoading}>
              {passLoading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
              Update Password
            </button>
          </form>

          <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#F1F5F9' }}>Two-Factor Authentication</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              Enhance your account security by enabling 2FA. This feature will be available in the next security update.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
