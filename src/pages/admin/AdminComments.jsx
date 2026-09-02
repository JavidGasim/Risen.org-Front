import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Edit3, Trash2, Save, X } from 'lucide-react';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const fetchComments = async () => {
    try {
      const res = await api.get('/admin/comments');
      const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setComments(items);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content ?? comment.body ?? comment.text ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/comments/${id}`, { content: editingContent });
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, content: editingContent } : c)));
      cancelEdit();
    } catch (err) {
      console.error('Failed to save comment:', err);
      fetchComments();
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/admin/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      fetchComments();
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'white' }}>Comments</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Moderate comments — edit content or remove spam/offensive comments.</p>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading comments...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Comment</th>
                  <th style={{ padding: '12px' }}>Author</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Post</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>No comments found.</td>
                  </tr>
                ) : (
                  comments.map((comment) => (
                    <tr key={comment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{comment.id}</td>

                      <td style={{ padding: '12px', minWidth: '300px' }}>
                        {editingId === comment.id ? (
                          <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', borderRadius: '8px', resize: 'vertical' }} />
                        ) : (
                          <div style={{ maxWidth: '500px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{comment.content || comment.body || comment.text || '(no content)'}</div>
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>{comment.authorName || comment.author || comment.userName || comment.senderName || 'Unknown'}</td>

                      <td style={{ padding: '12px' }}>{(() => { const email = comment.senderEmail || comment.senderEmailAddress || comment.authorEmail || comment.user?.email || null; return email ? <a href={`mailto:${email}`} style={{ color: 'inherit' }}>{email}</a> : '—'; })()}</td>

                      <td style={{ padding: '12px' }}>{comment.postTitle || comment.post?.title || comment.postId || comment.post?.id || '—'}</td>

                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {editingId === comment.id ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => saveEdit(comment.id)} className="btn btn-primary" style={{ padding: '8px 12px' }}><Save size={14} /> Save</button>
                            <button onClick={cancelEdit} className="btn btn-muted" style={{ padding: '8px 12px' }}><X size={14} /> Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => startEdit(comment)} className="btn btn-secondary" style={{ padding: '8px 12px' }}><Edit3 size={14} /> Edit</button>
                            <button onClick={() => deleteComment(comment.id)} className="btn btn-danger" style={{ padding: '8px 12px' }}><Trash2 size={14} /> Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}