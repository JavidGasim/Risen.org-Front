import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, UserCheck, UserX, Loader2, Users as UsersIcon } from 'lucide-react';
import {
  acceptFriendRequest,
  getFriendshipErrorMessage,
  getRequestId,
  getRequestSenderId,
  getUserDisplayName,
  getUserId,
  loadFriendshipData,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest
} from '../utils/friendship';

const Friends = () => {
  const { user } = useAuth();
  const [friendQuery, setFriendQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [friendshipData, setFriendshipData] = useState({ friends: [], incoming: [], outgoing: [] });
  const [friendshipLoading, setFriendshipLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [friendActionLoading, setFriendActionLoading] = useState({});

  const refreshFriendships = async () => {
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

  useEffect(() => {
    refreshFriendships();
  }, [user?.id]);

  const handleSearch = async () => {
    if (!friendQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const results = await searchUsers(friendQuery);
      const filtered = (results || []).filter((candidate) => getUserId(candidate) !== user?.id);
      setSearchResults(filtered);
    } catch (error) {
      setMessage({ type: 'error', text: getFriendshipErrorMessage(error) });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (targetUser) => {
    const targetId = getUserId(targetUser);
    if (!targetId) return;

    setFriendActionLoading((prev) => ({ ...prev, [targetId]: true }));
    setMessage({ type: '', text: '' });

    try {
      await sendFriendRequest(targetId);
      setMessage({ type: 'success', text: `Friend request sent to ${getUserDisplayName(targetUser)}.` });
      await refreshFriendships();
    } catch (error) {
      setMessage({ type: 'error', text: getFriendshipErrorMessage(error) });
    } finally {
      setFriendActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleRespondToRequest = async (request, action) => {
    const requestId = getRequestId(request);
    if (!requestId) return;

    setFriendActionLoading((prev) => ({ ...prev, [requestId]: true }));
    setMessage({ type: '', text: '' });

    try {
      if (action === 'accept') {
        await acceptFriendRequest(requestId);
        setMessage({ type: 'success', text: 'Friend request accepted.' });
      } else {
        await rejectFriendRequest(requestId);
        setMessage({ type: 'success', text: 'Friend request rejected.' });
      }

      await refreshFriendships();
    } catch (error) {
      setMessage({ type: 'error', text: getFriendshipErrorMessage(error) });
    } finally {
      setFriendActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const getRelationshipState = (targetUser) => {
    const targetId = getUserId(targetUser);
    if (!targetId) return 'add';

    const isFriend = friendshipData.friends.some((entry) => {
      const candidateIds = [getUserId(entry), getUserId(entry?.user), getUserId(entry?.friend)];
      return candidateIds.includes(targetId);
    });
    if (isFriend) return 'friends';

    const sent = friendshipData.outgoing.some((entry) => {
      const candidateIds = [getRequestSenderId(entry), getRequestSenderId(entry?.sender), getUserId(entry?.receiver)];
      return candidateIds.includes(targetId);
    });
    if (sent) return 'sent';

    const incoming = friendshipData.incoming.some((entry) => {
      const candidateIds = [getRequestSenderId(entry), getRequestSenderId(entry?.sender), getUserId(entry?.receiver)];
      return candidateIds.includes(targetId);
    });
    if (incoming) return 'incoming';

    return 'add';
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '60px' }}>
      <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.6rem', margin: 0 }}>Friends</h1>
          <p style={{ color: '#94A3B8', maxWidth: '760px', lineHeight: 1.7, marginTop: '8px' }}>
            Search other learners, send friend requests, and manage your friendship connections in one place.
          </p>
        </div>
      </div>

      {message.text && (
        <div style={{
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: message.type === 'success' ? '#10B981' : '#FCA5A5',
          padding: '14px 16px', borderRadius: '14px', marginBottom: '24px', fontWeight: 600
        }}>
          {message.text}
        </div>
      )}

      <div className="premium-card slide-up" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <input
            value={friendQuery}
            onChange={(e) => setFriendQuery(e.target.value)}
            className="form-control"
            placeholder="Search users by name or email"
            style={{ flex: '1 1 240px' }}
          />
          <button onClick={handleSearch} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </div>

        {searchLoading ? (
          <div style={{ color: '#94A3B8' }}>Searching users...</div>
        ) : searchResults.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {searchResults.map((candidate) => {
              const targetId = getUserId(candidate);
              const state = getRelationshipState(candidate);
              const isBusy = Boolean(friendActionLoading[targetId]);

              return (
                <div key={targetId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{getUserDisplayName(candidate)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{candidate.email || 'No email shared'}</div>
                  </div>
                  <button
                    onClick={() => handleSendFriendRequest(candidate)}
                    className={state === 'friends' ? 'btn btn-success' : state === 'sent' || state === 'incoming' ? 'btn btn-outline' : 'btn btn-primary'}
                    disabled={state !== 'add' || isBusy}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                  >
                    {isBusy ? <Loader2 size={16} className="animate-spin" /> : state === 'friends' ? <UserCheck size={16} /> : state === 'sent' ? <UserPlus size={16} /> : state === 'incoming' ? <UserX size={16} /> : <UserPlus size={16} />}
                    {state === 'friends' ? 'Friend' : state === 'sent' ? 'Request Sent' : state === 'incoming' ? 'Incoming Request' : 'Add Friend'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : friendQuery.trim() ? (
          <div style={{ color: '#94A3B8' }}>No users found.</div>
        ) : null}
      </div>

      <div className="premium-card slide-up" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <UsersIcon size={20} color="#10B981" />
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Pending Requests</h2>
        </div>

        {friendshipLoading ? (
          <div style={{ color: '#94A3B8' }}>Loading requests...</div>
        ) : friendshipData.incoming.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {friendshipData.incoming.map((request) => {
              const requestId = getRequestId(request);
              const senderName = request.sender?.fullName || request.sender?.firstName || request.sender?.name || request.fromUser?.fullName || request.user?.fullName || 'Someone';
              const isBusy = Boolean(friendActionLoading[requestId]);

              return (
                <div key={requestId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{senderName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Sent you a friend request</div>
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
    </div>
  );
};

export default Friends;
