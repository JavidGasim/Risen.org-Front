import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Heart, MessageCircle, Send, Trash2, ThumbUp, Loader2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedComments, setLikedComments] = useState([]);
  const [currentId, setCurrentId] = useState(user?.id || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});

  const normalizePosts = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return value.posts || value.items || [];
  };

  const loadFeed = async () => {
    try {
      setError('');
      setLoading(true);

      const [allRes, myRes] = await Promise.all([
        api.get('/Posts/getAll'),
        api.get('/Posts/getMyPosts')
      ]);

      const allPosts = normalizePosts(allRes.data);
      const myData = myRes.data || {};
      const likedPostItems = Array.isArray(myData.likedPosts) ? myData.likedPosts : [];
      const likedCommentItems = Array.isArray(myData.likedComments) ? myData.likedComments : [];

      setPosts(allPosts);
      setLikedPosts(likedPostItems);
      setLikedComments(likedCommentItems);
      setCurrentId(myData.currentId || user?.id || '');
    } catch (err) {
      console.error('Failed to load community feed', err);
      setError('Unable to load community feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const likedPostIds = useMemo(
    () => new Set(likedPosts.map((item) => item.postId || item.post?.id || item.id)),
    [likedPosts]
  );

  const likedCommentIds = useMemo(
    () => new Set(likedComments.map((item) => item.commentId || item.comment?.id || item.id)),
    [likedComments]
  );

  const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return 'Just now';
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getUserLabel = (item) => {
    if (!item) return 'Unknown';
    return item.firstName || item.fullName || item.name || item.userName || 'Unknown';
  };

  const handleNewPost = async () => {
    if (!newPostText.trim()) return;
    try {
      setSaving(true);
      setError('');
      await api.post('/Posts/addPost', null, {
        params: { text: newPostText.trim() }
      });
      setNewPostText('');
      await loadFeed();
    } catch (err) {
      console.error('Failed to publish post', err);
      setError(err.response?.data?.message || 'Failed to publish your post.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePostLike = async (postId) => {
    try {
      setSaving(true);
      setError('');
      await api.post('/Posts/likePost', null, {
        params: { id: postId, currentId }
      });
      await loadFeed();
    } catch (err) {
      console.error('Failed to toggle post like', err);
      setError(err.response?.data?.message || 'Unable to update post like.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    try {
      setSaving(true);
      setError('');
      await api.post('/Posts/likeComment', null, {
        params: { id: commentId, senderId: currentId }
      });
      await loadFeed();
    } catch (err) {
      console.error('Failed to toggle comment like', err);
      setError(err.response?.data?.message || 'Unable to update comment like.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (postId) => {
    const content = (commentDrafts[postId] || '').trim();
    if (!content) return;

    try {
      setSaving(true);
      setError('');
      await api.post('/Posts/addComment', null, {
        params: { id: postId, message: content, senderId: currentId }
      });
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      await loadFeed();
    } catch (err) {
      console.error('Failed to add comment', err);
      setError(err.response?.data?.message || 'Unable to add comment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      setSaving(true);
      setError('');
      await api.post('/Posts/deletePost', null, { params: { id: postId } });
      await loadFeed();
    } catch (err) {
      console.error('Failed to delete post', err);
      setError(err.response?.data?.message || 'Unable to delete post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      setSaving(true);
      setError('');
      await api.post('/Posts/deleteComment', null, { params: { id: commentId } });
      await loadFeed();
    } catch (err) {
      console.error('Failed to delete comment', err);
      setError(err.response?.data?.message || 'Unable to delete comment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '60px' }}>
      <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', margin: 0 }}>Community Feed</h1>
            <p style={{ color: '#94A3B8', maxWidth: '720px', lineHeight: 1.7, marginTop: '8px' }}>
              Share quick updates, celebrate progress, and connect with other learners through likes and comments.
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '16px 18px', borderRadius: '14px' }}>
            {error}
          </div>
        )}
      </div>

      <div className="premium-card slide-up" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Write a new post</h2>
            <p style={{ color: '#94A3B8', marginTop: '8px' }}>Your peers can like and comment on your post.</p>
          </div>
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            rows={4}
            placeholder="Share something with the community..."
            className="form-control"
            style={{ minHeight: '130px', resize: 'vertical', background: 'rgba(255,255,255,0.05)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8' }}>Your post will be visible to all registered users.</span>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleNewPost}
              disabled={!newPostText.trim() || saving}
              style={{ minWidth: '140px' }}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Publish
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center fade-in" style={{ minHeight: '40vh', flexDirection: 'column', gap: '18px' }}>
          <Loader2 size={42} color="#6366F1" className="animate-spin" />
          <div style={{ color: '#94A3B8' }}>Loading community posts...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel slide-up" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ margin: 0, fontSize: '1.6rem' }}>No posts yet</h2>
          <p style={{ color: '#94A3B8', marginTop: '12px' }}>Be the first to share an update with the community.</p>
        </div>
      ) : (
        posts.map((post) => {
          const postId = post.id || post.postId;
          const postLiked = likedPostIds.has(postId);
          const commentCount = post.commentCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);

          return (
            <div key={postId} className="premium-card slide-up" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Posted by {getUserLabel(post.sender)} · {formatDate(post.shareDate)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.8, color: '#E2E8F0' }}>{post.text || post.content || ''}</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn ${postLiked ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleTogglePostLike(postId)}
                    disabled={saving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Heart size={16} /> {post.likeCount ?? 0}
                  </button>
                  {String(post.senderId) === String(currentId) && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleDeletePost(postId)}
                      disabled={saving}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#94A3B8', fontSize: '0.9rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={16} /> {commentCount} comments</span>
              </div>

              <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '18px' }}>
                <div style={{ marginBottom: '18px', fontWeight: 700, color: '#F8FAFC' }}>Comments</div>
                {Array.isArray(post.comments) && post.comments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {post.comments.map((comment) => {
                      const commentId = comment.id || comment.commentId;
                      const commentLiked = likedCommentIds.has(commentId);

                      return (
                        <div key={commentId} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '14px' }}>
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{getUserLabel(comment.sender)}</span>
                              <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>{formatDate(comment.writingDate)}</span>
                            </div>
                            <p style={{ margin: 0, color: '#CBD5E1', lineHeight: 1.8 }}>{comment.content || comment.message || ''}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className={`btn ${commentLiked ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => handleToggleCommentLike(commentId)}
                              disabled={saving}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <ThumbUp size={14} /> {comment.likeCount ?? 0}
                            </button>
                            {String(comment.senderId) === String(currentId) && (
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => handleDeleteComment(commentId)}
                                disabled={saving}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: '#94A3B8', padding: '18px 0' }}>No comments yet. Start the conversation below.</div>
                )}

                <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
                  <textarea
                    value={commentDrafts[postId] || ''}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [postId]: e.target.value }))}
                    rows={3}
                    placeholder="Write a comment..."
                    className="form-control"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleAddComment(postId)}
                      disabled={!commentDrafts[postId]?.trim() || saving}
                    >
                      <Send size={14} /> Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Posts;
