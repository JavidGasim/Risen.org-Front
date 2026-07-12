import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, AlertCircle, Loader2, UserCheck, UserX } from 'lucide-react';
import {
  acceptFriendRequest,
  getFriendshipErrorMessage,
  getRequestId,
  getUserDisplayName,
  loadFriendshipData,
  rejectFriendRequest
} from '../utils/friendship';

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const refreshNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await loadFriendshipData(user.id);
      setRequests(data.incoming || []);
      setItems([
        {
          id: 'friend-requests',
          title: 'Friend requests',
          text: data.incoming?.length ? `${data.incoming.length} pending request${data.incoming.length > 1 ? 's' : ''} waiting for your reply.` : 'No new requests right now.',
          type: data.incoming?.length ? 'info' : 'success'
        },
        {
          id: 'community-updates',
          title: 'Community updates',
          text: 'New likes and comments will appear here as they happen.',
          type: 'success'
        }
      ]);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [user?.id]);

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

  return (
    <div className="container fade-in" style={{ paddingBottom: '60px' }}>
      <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell size={24} color="#10B981" />
          <h1 style={{ fontSize: '2.4rem', margin: 0 }}>Notifications</h1>
        </div>
        <p style={{ color: '#94A3B8', maxWidth: '760px', lineHeight: 1.7, margin: 0 }}>
          Incoming friend requests and community activity updates are gathered here.
        </p>
      </div>

      {message.text && (
        <div style={{ background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, color: message.type === 'success' ? '#10B981' : '#FCA5A5', padding: '12px 16px', borderRadius: '14px', marginBottom: '20px', fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      <div className="premium-card slide-up" style={{ padding: '28px' }}>
        {loading ? (
          <div style={{ color: '#94A3B8' }}>Loading notifications...</div>
        ) : items.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ marginTop: '2px' }}>
                  {item.type === 'success' ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#818CF8" />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ color: '#94A3B8', lineHeight: 1.6 }}>{item.text}</div>
                </div>
              </div>
            ))}

            {requests.length > 0 && (
              <div style={{ marginTop: '8px', display: 'grid', gap: '12px' }}>
                {requests.map((request) => {
                  const requestId = getRequestId(request);
                  const senderName = request.sender?.fullName || request.sender?.firstName || request.sender?.name || request.user?.fullName || request.user?.firstName || 'Someone';
                  const isBusy = Boolean(actionLoading[requestId]);

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
            )}
          </div>
        ) : (
          <div style={{ color: '#94A3B8' }}>No notifications yet.</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
