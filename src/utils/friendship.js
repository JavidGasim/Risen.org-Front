import api from './api';

const normalizeItems = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.friends)) return value.friends;
  if (Array.isArray(value?.requests)) return value.requests;
  return [];
};

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Friendship action failed.';

const tryRequests = async (candidates) => {
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await candidate.request();
      return response;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 405 || status === 400) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Friendship endpoint unavailable.');
};

export const getUserDisplayName = (user = {}) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  return user.fullName || user.name || user.email || 'User';
};

export const getUserId = (user = {}) => user?.id || user?.userId || user?.user?.id || user?.userId || null;

export const getRequestId = (request = {}) => request?.id || request?.friendshipId || request?.requestId || request?.friendRequestId || null;

export const getRequestSenderId = (request = {}) => request?.senderId || request?.senderUserId || request?.requesterId || request?.fromUserId || request?.creatorId || request?.sender?.id || request?.user?.id || null;

export const getRequestReceiverId = (request = {}) => request?.receiverId || request?.receiverUserId || request?.targetUserId || request?.toUserId || request?.recipientId || request?.receiver?.id || null;

export const getRelationshipLabel = ({ user, friends = [], incoming = [], outgoing = [] }) => {
  const targetId = getUserId(user);
  if (!targetId) return 'Add Friend';

  const inFriends = friends.some((entry) => getUserId(entry) === targetId || getUserId(entry?.user) === targetId || getUserId(entry?.friend) === targetId);
  if (inFriends) return 'Friends';

  const sent = outgoing.some((entry) => getRequestReceiverId(entry) === targetId || getRequestSenderId(entry) === targetId);
  if (sent) return 'Request Sent';

  const received = incoming.some((entry) => getRequestSenderId(entry) === targetId || getRequestReceiverId(entry) === targetId);
  if (received) return 'Accept / Reject';

  return 'Add Friend';
};

export const searchUsers = async (query) => {
  if (!query?.trim()) return [];

  const candidates = [
    () => api.get('/Users/search', { params: { q: query.trim(), limit: 10 } }),
    () => api.get('/users/search', { params: { q: query.trim(), limit: 10 } }),
    () => api.get('/Users', { params: { search: query.trim(), limit: 10 } }),
    () => api.get('/users', { params: { search: query.trim(), limit: 10 } }),
    () => api.get('/User/search', { params: { q: query.trim(), limit: 10 } }),
    () => api.get('/admin/users', { params: { search: query.trim(), limit: 10 } })
  ];

  const response = await tryRequests(candidates);
  const payload = response?.data;
  return normalizeItems(payload);
};

export const loadFriendshipData = async (userId) => {
  const candidates = [
    () => api.get('/Friendships', { params: { userId } }),
    () => api.get('/friendships', { params: { userId } }),
    () => api.get('/Friends', { params: { userId } }),
    () => api.get('/friends', { params: { userId } }),
    () => api.get('/Friendships/me', { params: { userId } })
  ];

  const response = await tryRequests(candidates);
  const payload = response?.data || {};

  const friends = normalizeItems(payload?.friends || payload?.acceptedFriends || payload?.items || payload?.data || payload?.friendships);
  const incoming = normalizeItems(payload?.incomingRequests || payload?.incoming || payload?.receivedRequests || payload?.requests?.incoming);
  const outgoing = normalizeItems(payload?.outgoingRequests || payload?.outgoing || payload?.sentRequests || payload?.requests?.outgoing);

  return { friends, incoming, outgoing };
};

export const sendFriendRequest = async (targetUserId) => {
  const candidates = [
    () => api.post('/Friendships', { receiverId: targetUserId }),
    () => api.post('/friendships', { receiverId: targetUserId }),
    () => api.post('/Friendships/request', { receiverId: targetUserId }),
    () => api.post('/friendships/request', { receiverId: targetUserId }),
    () => api.post('/Friends/request', { receiverId: targetUserId }),
    () => api.post('/friends/request', { receiverId: targetUserId }),
    () => api.post(`/Friendships/${targetUserId}/request`),
    () => api.post(`/friends/${targetUserId}/request`)
  ];

  const response = await tryRequests(candidates);
  return response?.data;
};

export const acceptFriendRequest = async (requestId) => {
  const candidates = [
    () => api.post(`/Friendships/${requestId}/accept`),
    () => api.post(`/friendships/${requestId}/accept`),
    () => api.post(`/Friends/${requestId}/accept`),
    () => api.post(`/friends/${requestId}/accept`),
    () => api.put(`/Friendships/${requestId}`, { status: 'Accepted' })
  ];

  const response = await tryRequests(candidates);
  return response?.data;
};

export const rejectFriendRequest = async (requestId) => {
  const candidates = [
    () => api.post(`/Friendships/${requestId}/reject`),
    () => api.post(`/friendships/${requestId}/reject`),
    () => api.post(`/Friends/${requestId}/reject`),
    () => api.post(`/friends/${requestId}/reject`),
    () => api.put(`/Friendships/${requestId}`, { status: 'Rejected' })
  ];

  const response = await tryRequests(candidates);
  return response?.data;
};

export const isFriendshipActionError = (error) => {
  return Boolean(error) && !['404', '405', '400'].includes(String(error?.response?.status));
};

export const getFriendshipErrorMessage = (error) => getErrorMessage(error);
