import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  User, Mail, School, ShieldCheck,
  Save, Key, Loader2, CheckCircle2, AlertCircle,
  Users, UserPlus, UserCheck, UserX, Search as SearchIcon
} from 'lucide-react';
import {
  acceptFriendRequest,
  getFriendshipErrorMessage,
  getRequestId,
  getRequestSenderId,
  getRelationshipLabel,
  getUserDisplayName,
  getUserId,
  loadFriendshipData,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest
} from '../utils/friendship';

const Profile = () => {
  const { user, refreshStats } = useAuth();

  // Profile Info State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    universityId: '',
    universityName: ''
  });

  // Password State
  const [passwords, setPasswords] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [resetStep, setResetStep] = useState(1); // 1: Request, 2: Reset

  // UI State
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [friendQuery, setFriendQuery] = useState('');
  const [friendSearchResults, setFriendSearchResults] = useState([]);
  const [friendSearchLoading, setFriendSearchLoading] = useState(false);
  const [friendshipData, setFriendshipData] = useState({ friends: [], incoming: [], outgoing: [] });
  const [friendshipLoading, setFriendshipLoading] = useState(false);
  const [friendshipMessage, setFriendshipMessage] = useState({ type: '', text: '' });
  const [friendActionLoading, setFriendActionLoading] = useState({});

  // Load initial data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        universityId: user.universityId || '',
        universityName: user.universityName || ''
      });
      setSearchQuery(user.universityName || '');
    }
  }, [user]);

  useEffect(() => {
    const loadFriendships = async () => {
      if (!user?.id) return;
      setFriendshipLoading(true);
      try {
        const data = await loadFriendshipData(user.id);
        setFriendshipData(data);
      } catch (error) {
        console.error('Failed to load friendships', error);
      } finally {
        setFriendshipLoading(false);
      }
    };

    loadFriendships();
  }, [user?.id]);

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

  const handleFriendSearch = async () => {
    if (!friendQuery.trim()) {
      setFriendSearchResults([]);
      return;
    }

    setFriendSearchLoading(true);
    setFriendshipMessage({ type: '', text: '' });

    try {
      const results = await searchUsers(friendQuery);
      const filtered = (results || []).filter((candidate) => getUserId(candidate) !== user?.id);
      setFriendSearchResults(filtered);
    } catch (error) {
      setFriendshipMessage({ type: 'error', text: getFriendshipErrorMessage(error) });
    } finally {
      setFriendSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (targetUser) => {
    const targetId = getUserId(targetUser);
    if (!targetId) return;

    setFriendActionLoading((prev) => ({ ...prev, [targetId]: true }));
    setFriendshipMessage({ type: '', text: '' });

    try {
      await sendFriendRequest(targetId);
      setFriendshipMessage({ type: 'success', text: `Friend request sent to ${getUserDisplayName(targetUser)}.` });
      const data = await loadFriendshipData(user.id);
      setFriendshipData(data);
    } catch (error) {
      setFriendshipMessage({ type: 'error', text: getFriendshipErrorMessage(error) });
    } finally {
      setFriendActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleRespondToRequest = async (request, action) => {
    const requestId = getRequestId(request);
    if (!requestId) return;

    setFriendActionLoading((prev) => ({ ...prev, [requestId]: true }));
    setFriendshipMessage({ type: '', text: '' });

    try {
      if (action === 'accept') {
        await acceptFriendRequest(requestId);
        setFriendshipMessage({ type: 'success', text: 'Friend request accepted.' });
      } else {
        await rejectFriendRequest(requestId);
        setFriendshipMessage({ type: 'success', text: 'Friend request rejected.' });
      }

      const data = await loadFriendshipData(user.id);
      setFriendshipData(data);
    } catch (error) {
      setFriendshipMessage({ type: 'error', text: getFriendshipErrorMessage(error) });
    } finally {
      setFriendActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/Me', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
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

        <div className="premium-card slide-up" style={{ padding: '32px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Users size={24} color="#10B981" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Friends & Requests</h2>
          </div>

          {friendshipMessage.text && (
            <div className="slide-up" style={{
              background: friendshipMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${friendshipMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              color: friendshipMessage.type === 'success' ? '#10B981' : '#FCA5A5',
              padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600
            }}>
              {friendshipMessage.text}
            </div>
          )}

          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search people to add"
                value={friendQuery}
                onChange={(e) => setFriendQuery(e.target.value)}
                style={{ flex: '1 1 240px' }}
              />
              <button onClick={handleFriendSearch} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {friendSearchLoading ? <Loader2 size={18} className="animate-spin" /> : <SearchIcon size={18} />}
                Search
              </button>
            </div>

            {friendSearchLoading ? (
              <div style={{ color: '#94A3B8' }}>Searching users...</div>
            ) : friendSearchResults.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {friendSearchResults.map((candidate) => {
                  const targetId = getUserId(candidate);
                  const relationship = getRelationshipLabel({ user: candidate, friends: friendshipData.friends, incoming: friendshipData.incoming, outgoing: friendshipData.outgoing });
                  const isBusy = Boolean(friendActionLoading[targetId]);

                  return (
                    <div key={targetId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{getUserDisplayName(candidate)}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{candidate.email || 'No email shared'}</div>
                      </div>
                      <button
                        onClick={() => handleSendFriendRequest(candidate)}
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                        disabled={relationship !== 'Add Friend' || isBusy}
                      >
                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : relationship === 'Add Friend' ? <UserPlus size={16} /> : <UserCheck size={16} />}
                        {relationship}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : friendQuery.trim() ? (
              <div style={{ color: '#94A3B8' }}>No users found.</div>
            ) : null}
          </div>

          <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
            <div>
              <h3 style={{ marginBottom: '12px', color: '#F8FAFC' }}>Incoming Requests</h3>
              {friendshipLoading ? (
                <div style={{ color: '#94A3B8' }}>Loading requests...</div>
              ) : friendshipData.incoming.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {friendshipData.incoming.map((request) => {
                    const senderId = getRequestSenderId(request);
                    const isBusy = Boolean(friendActionLoading[getRequestId(request)]);
                    const senderName = request.sender?.fullName || request.sender?.firstName || request.sender?.name || request.fromUser?.fullName || request.fromUser?.firstName || request.user?.fullName || request.user?.firstName || 'Someone';

                    return (
                      <div key={getRequestId(request)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{senderName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Wants to be your friend</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleRespondToRequest(request, 'accept')} className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={isBusy}>
                            {isBusy ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                            Accept
                          </button>
                          <button onClick={() => handleRespondToRequest(request, 'reject')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={isBusy}>
                            {isBusy ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: '#94A3B8' }}>No pending requests.</div>
              )}
            </div>

            <div>
              <h3 style={{ marginBottom: '12px', color: '#F8FAFC' }}>Your Friends</h3>
              {friendshipLoading ? (
                <div style={{ color: '#94A3B8' }}>Loading friends...</div>
              ) : friendshipData.friends.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {friendshipData.friends.map((friend, index) => {
                    const friendUser = friend.user || friend.friend || friend.targetUser || friend.receiver || friend.sender || friend;
                    const displayName = getUserDisplayName(friendUser);
                    return (
                      <div key={friend.id || friend.userId || friend.friendId || index} style={{ padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}>
                        {displayName}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: '#94A3B8' }}>No friends yet.</div>
              )}
            </div>
          </div>
        </div>

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
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text" className="form-control"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email" className="form-control"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
                <Mail size={16} color="#475569" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', display: 'block' }}>Note: Changing your email will update your login credentials.</span>
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
                        setProfileData({ ...profileData, universityId: uni.id, universityName: uni.name });
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

          {resetStep === 1 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                To change your password, you must first request a reset token which will be sent to <strong>{profileData.email}</strong>.
              </p>
              <button
                onClick={handleRequestToken}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
                    placeholder="Enter token from email"
                    value={passwords.token}
                    onChange={(e) => setPasswords({ ...passwords, token: e.target.value })}
                    required
                  />
                  <Key size={16} color="#475569" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password" className="form-control"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password" className="form-control"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
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
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={passLoading}
                >
                  {passLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Reset Password
                </button>
              </div>
            </form>
          )}

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
