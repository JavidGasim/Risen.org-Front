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
  const fullName = [user?.firstName || user?.FirstName, user?.lastName || user?.LastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  return user?.fullName || user?.FullName || user?.name || user?.Name || user?.email || user?.Email || 'User';
};

export const getUserEmail = (user = {}) => user?.email || user?.Email || user?.userName || user?.UserName || '';

export const getUserId = (user = {}) => user?.id || user?.Id || user?.userId || user?.userID || user?.user?.id || user?.user?.Id || null;

export const getRequestId = (request = {}) => request?.id || request?.Id || request?.friendshipId || request?.friendshipId || request?.requestId || request?.RequestId || request?.friendRequestId || request?.friendRequestId || null;

export const getRequestSenderId = (request = {}) => request?.senderId || request?.SenderId || request?.senderUserId || request?.senderUserId || request?.requesterId || request?.RequesterId || request?.fromUserId || request?.FromUserId || request?.creatorId || request?.CreatorId || request?.sender?.id || request?.sender?.Id || request?.user?.id || request?.user?.Id || null;

export const getRequestReceiverId = (request = {}) => request?.receiverId || request?.ReceiverId || request?.receiverUserId || request?.receiverUserId || request?.targetUserId || request?.TargetUserId || request?.toUserId || request?.ToUserId || request?.recipientId || request?.RecipientId || request?.receiver?.id || request?.receiver?.Id || null;

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
    const response = await api.get('/Friend/search', {
      params: { searchTerm: normalizedQuery }
    });
    const payload = response?.data || [];

    const list = Array.isArray(payload)
      ? payload
      : normalizeItems(payload);

    return (list || []).slice(0, 10);
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
