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
      setComments(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  const startEdit = (c) => { setEditingId(c.id); setEditingContent(c.content || c.body || ''); };
  const cancelEdit = () => { setEditingId(null); setEditingContent(''); };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/comments/${id}`, { content: editingContent });
      setComments((prev) => prev.map(c => c.id === id ? { ...c, content: editingContent } : c));
      cancelEdit();
    } catch (err) {
      console.error('Failed to save comment', err);
      fetchComments();
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/admin/comments/${id}`);
      setComments((prev) => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete comment', err);
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
                  <th style={{ padding: '12px' }}>Post</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>No comments found.</td></tr>
                ) : comments.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{String(c.id).substring(0, 8)}...</td>
                    <td style={{ padding: '12px' }}>
                      {editingId === c.id ? (
                        <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', borderRadius: '8px' }} />
                      ) : (
                        <div>{c.content || c.body || '(no content)'}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{c.authorName || c.author || c.userName || 'Unknown'}</td>
                    <td style={{ padding: '12px' }}>{c.postTitle || c.post?.title || c.postId || '—'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {editingId === c.id ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => saveEdit(c.id)} className="btn btn-primary" style={{ padding: '8px 12px' }}><Save size={14} /> Save</button>
                          <button onClick={cancelEdit} className="btn btn-muted" style={{ padding: '8px 12px' }}><X size={14} /> Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => startEdit(c)} className="btn btn-secondary" style={{ padding: '8px 12px' }}><Edit3 size={14} /> Edit</button>
                          <button onClick={() => deleteComment(c.id)} className="btn btn-danger" style={{ padding: '8px 12px' }}><Trash2 size={14} /> Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
