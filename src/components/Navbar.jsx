import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Zap, Compass, Trophy, User, 
  Sparkles, Target, LogOut, GraduationCap, Star, Activity, ChevronDown, Heart, Bell, Users,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { loadFriendshipData, getRequestSenderName, getRequestId, acceptFriendRequest, rejectFriendRequest, getFriendshipErrorMessage } from '../utils/friendship';

const Navbar = () => {
  const { isAuthenticated, logout, user, stats } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/');
  };

  const refreshNotifications = async () => {
    if (!user?.id) return;

    setLoadingRequests(true);
    try {
      const data = await loadFriendshipData(user.id);
      setRequests(data.incoming || []);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRespondToRequest = async (request, action) => {
    const requestId = getRequestId(request);
    if (!requestId) return;

    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    setMessage({ type: '', text: '' });

    try {
      if (action === 'accept') {
        await acceptFriendRequest(requestId);
        setMessage({ type: 'success', text: 'Friend request accepted.' });
      } else {
        await rejectFriendRequest(requestId);
        setMessage({ type: 'error', text: 'Friend request rejected.' });
      }

      await refreshNotifications();
    } catch (error) {
      setMessage({ type: 'error', text: getFriendshipErrorMessage(error) });
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    }
  }, [isAuthenticated, user?.id]);

  return (
    <nav className="app-navbar" style={{
      padding: '20px 40px',
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="app-navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link className="app-navbar-brand" to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <ShieldAlert size={28} color="#10B981" />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px', color: '#fff' }}>
            RISEN<span style={{ color: '#10B981' }}>.ORG</span>
          </span>
        </Link>
        
        {isAuthenticated && (
          <div className="app-navbar-links" style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', fontWeight: 600 }}>
            {[
              { to: '/dashboard', icon: <Compass size={18} />, label: 'Dashboard' },
              { to: '/subjects', icon: <Zap size={18} />, label: 'Subjects' },
              { to: '/posts', icon: <Heart size={18} />, label: 'Community' },
              { to: '/friends', icon: <Users size={18} />, label: 'Friends' },
              { to: '/quest', icon: <Target size={18} />, label: 'Quests' },
              { to: '/leaderboards', icon: <Trophy size={18} />, label: 'Leaderboards' },
              { to: '/pricing', icon: <Sparkles size={18} />, label: 'Upgrade', color: '#F59E0B' },
            ].map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: link.color || '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = link.color || '#94A3B8'}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="app-navbar-actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isAuthenticated ? (
          <div className="app-navbar-auth" style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px' }}>Join the League</Link>
          </div>
        ) : (
          <>
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative'
                }}
              >
                <Bell size={18} color="#F8FAFC" />
                {requests.length > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px', borderRadius: '999px', background: '#10B981', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {requests.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div style={{ position: 'absolute', top: '120%', right: 0, width: '320px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', padding: '16px', zIndex: 1000 }}>
                  <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '12px' }}>Notifications</div>
                  {message.text && (
                    <div style={{ background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: message.type === 'success' ? '#10B981' : '#FCA5A5', padding: '8px 10px', borderRadius: '12px', marginBottom: '10px', fontSize: '0.85rem' }}>
                      {message.text}
                    </div>
                  )}
                  {loadingRequests ? (
                    <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Loading requests...</div>
                  ) : requests.length > 0 ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {requests.map((request) => {
                        const requestId = getRequestId(request);
                        const senderName = getRequestSenderName(request) || 'Someone';
                        const isBusy = Boolean(actionLoading[requestId]);

                        return (
                          <div key={requestId} style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                              <AlertCircle size={16} color="#818CF8" />
                              <div>
                                <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.9rem' }}>{senderName}</div>
                                <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>Sent you a friend request</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleRespondToRequest(request, 'accept')} className="btn btn-success" style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem' }} disabled={isBusy}>
                                {isBusy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                Accept
                              </button>
                              <button onClick={() => handleRespondToRequest(request, 'reject')} className="btn btn-outline" style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem' }} disabled={isBusy}>
                                {isBusy ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />}
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No new requests.</div>
                  )}
                </div>
              )}
            </div>

            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', 
                  background: 'rgba(255,255,255,0.03)', padding: '6px 16px', 
                  borderRadius: '50px', border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                  {(user?.firstName || user?.fullName || 'U')[0]}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.2 }}>{user?.firstName || 'User'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.entitlement?.plan || 'Free'} Member</div>
                </div>
                <ChevronDown size={14} color="#94A3B8" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </div>
          </>
        )}

        {isProfileOpen && (
          <div className="fade-in slide-up app-profile-menu" style={{
            position: 'absolute', top: '120%', right: 0, width: '320px',
            background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            padding: '28px', zIndex: 1000
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                {(user?.firstName || 'U')[0]}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>{user?.fullName || `${user?.firstName} ${user?.lastName}`}</h3>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                <GraduationCap size={16} color="#6366F1" /> {user?.university?.name || 'Academic Member'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Activity size={18} color="#10B981" style={{ marginBottom: '6px' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F8FAFC' }}>{stats?.currentStreak || 0}</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Streak</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Star size={18} color="#F59E0B" style={{ marginBottom: '6px' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F8FAFC' }}>{stats?.totalXp || 0}</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total XP</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818CF8', fontSize: '0.9rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={16} /> Risen Score
                  </div>
                  <span style={{ fontSize: '1.1rem' }}>{stats?.risenScore?.toFixed(2) || '0.00'}</span>
               </div>
               
                <Link 
                 to="/profile"
                 onClick={() => setIsProfileOpen(false)}
                 style={{ 
                   width: '100%', padding: '14px', borderRadius: '14px', 
                   background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                   color: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                   justifyContent: 'center', gap: '10px', fontWeight: 700, transition: 'all 0.2s',
                   textDecoration: 'none', marginBottom: '8px'
                 }}
                 onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  <User size={20} /> Settings
                </Link>
                
               <button 
                onClick={handleLogout}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '14px', 
                  background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', 
                  color: '#FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', gap: '10px', fontWeight: 700, transition: 'all 0.2s',
                  marginTop: '10px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)'; }}
               >
                 <LogOut size={20} /> Terminate Session
               </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
