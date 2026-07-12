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

  const normalizedQuery = query.trim();

  try {
    const response = await api.get('/Friend/users');
    const payload = response?.data || [];

    const list = Array.isArray(payload)
      ? payload
      : normalizeItems(payload);

    return (list || []).filter((user) => {
      const haystacks = [
        user?.fullName,
        user?.firstName,
        user?.lastName,
        user?.email,
        user?.userName,
        user?.name,
        user?.username
      ].filter(Boolean);

      const text = haystacks.join(' ').toLowerCase();
      return text.includes(normalizedQuery.toLowerCase());
    }).slice(0, 10);
  } catch (error) {
    console.error('Failed to search users', error);
    return [];
  }
};

export const loadFriendshipData = async (userId) => {
  const response = await api.get('/Friend/all').catch(() => ({ data: [] }));
  const payload = response?.data || [];

  const friends = Array.isArray(payload)
    ? payload
    : normalizeItems(payload?.friends || payload?.acceptedFriends || payload?.items || payload?.data || payload?.friendships);

  return {
    friends,
    incoming: [],
    outgoing: []
  };
};

export const sendFriendRequest = async (targetUserId) => {
  const response = await api.post(`/Friend/send-request/${targetUserId}`);
  return response?.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await api.post(`/Friend/accept/${requestId}`);
  return response?.data;
};

export const rejectFriendRequest = async (requestId) => {
  const response = await api.post(`/Friend/reject/${requestId}`).catch((error) => {
    throw new Error(error?.response?.data?.message || 'Reject endpoint is not available for this backend.');
  });

  return response?.data;
};

export const isFriendshipActionError = (error) => {
  return Boolean(error) && !['404', '405', '400'].includes(String(error?.response?.status));
};

export const getFriendshipErrorMessage = (error) => getErrorMessage(error);
