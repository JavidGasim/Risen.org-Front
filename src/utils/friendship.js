import api from './api';

const friendshipStore = {
  friends: [],
  incoming: [],
  outgoing: []
};

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
  return user?.fullName || user?.FullName || user?.name || user?.Name || user?.userName || user?.UserName || user?.email || user?.Email || 'User';
};

const normalizeFriendEntry = (entry) => {
  if (!entry) return null;

  const normalized = {
    ...entry,
    id: getUserId(entry),
    Id: getUserId(entry),
    fullName: getUserDisplayName(entry),
    FullName: getUserDisplayName(entry),
    email: entry?.email || entry?.Email || entry?.userName || entry?.UserName || '',
    Email: entry?.email || entry?.Email || entry?.userName || entry?.UserName || ''
  };

  return normalized;
};

export const getUserEmail = (user = {}) => user?.email || user?.Email || user?.userName || user?.UserName || '';

export const getUserId = (user = {}) => user?.id || user?.Id || user?.userId || user?.userID || user?.user?.id || user?.user?.Id || null;

export const getRequestId = (request = {}) => request?.id || request?.Id || request?.friendshipId || request?.friendshipId || request?.requestId || request?.RequestId || request?.friendRequestId || request?.friendRequestId || null;

export const getRequestSenderId = (request = {}) => {
  const sender = request?.sender || request?.Sender || request?.user || request?.User || request?.fromUser || request?.FromUser || request?.requester || request?.Requester || null;
  return request?.senderId || request?.SenderId || request?.senderUserId || request?.senderUserId || request?.requesterId || request?.RequesterId || request?.fromUserId || request?.FromUserId || request?.creatorId || request?.CreatorId || sender?.id || sender?.Id || sender?.userId || sender?.userID || null;
};

export const getRequestReceiverId = (request = {}) => {
  const receiver = request?.receiver || request?.Receiver || request?.toUser || request?.ToUser || request?.recipient || request?.Recipient || request?.targetUser || request?.TargetUser || null;
  return request?.receiverId || request?.ReceiverId || request?.receiverUserId || request?.receiverUserId || request?.targetUserId || request?.TargetUserId || request?.toUserId || request?.ToUserId || request?.recipientId || request?.RecipientId || receiver?.id || receiver?.Id || receiver?.userId || receiver?.userID || null;
};

export const getRequestSenderName = (request = {}) => {
  const sender = request?.sender || request?.Sender || request?.user || request?.User || request?.fromUser || request?.FromUser || request?.requester || request?.Requester || null;
  return getUserDisplayName(sender);
};

export const getRequestReceiverName = (request = {}) => {
  const receiver = request?.receiver || request?.Receiver || request?.toUser || request?.ToUser || request?.recipient || request?.Recipient || request?.targetUser || request?.TargetUser || null;
  return getUserDisplayName(receiver);
};

const trackOutgoingRequest = (targetUserId) => {
  if (!targetUserId) return;

  const existing = friendshipStore.outgoing.some((entry) => {
    const entryReceiverId = getRequestReceiverId(entry);
    return String(entryReceiverId) === String(targetUserId);
  });

  if (!existing) {
    friendshipStore.outgoing.push({
      id: `local-${Date.now()}-${targetUserId}`,
      senderId: null,
      receiverId: targetUserId
    });
  }
};

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
  void userId;

  const [friendsResponse, sentResponse, receivedResponse] = await Promise.all([
    api.get('/Friend/all').catch(() => ({ data: [] })),
    api.get('/Friend/sent-requests').catch(() => ({ data: [] })),
    api.get('/Friend/received-requests').catch(() => ({ data: [] }))
  ]);

  const friends = normalizeItems(friendsResponse?.data).map(normalizeFriendEntry).filter(Boolean);
  const outgoing = normalizeItems(sentResponse?.data);
  const incoming = normalizeItems(receivedResponse?.data);

  return {
    friends: [...friends, ...friendshipStore.friends.filter((entry) => !friends.some((friend) => getUserId(friend) && getUserId(friend) === getUserId(entry)))],
    incoming,
    outgoing: [...outgoing, ...friendshipStore.outgoing.filter((entry) => !outgoing.some((request) => getRequestReceiverId(request) && getRequestReceiverId(request) === getRequestReceiverId(entry)))]
  };
};

export const sendFriendRequest = async (targetUserId) => {
  const response = await api.post(`/Friend/send-request/${targetUserId}`);
  trackOutgoingRequest(targetUserId);
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
