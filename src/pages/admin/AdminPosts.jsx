import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Edit3, Trash2, Save, X } from 'lucide-react';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({ title: '', content: '' });

  const fetchPosts = async () => {
    try {
      const res = await api.get('/admin/posts');
      setPosts(res.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditingValues({ title: post.title || '', content: post.content || '' });
  };

  const cancelEdit = () => { setEditingId(null); setEditingValues({ title: '', content: '' }); };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/posts/${id}`, { title: editingValues.title, content: editingValues.content });
      setPosts((prev) => prev.map(p => p.id === id ? { ...p, title: editingValues.title, content: editingValues.content } : p));
      cancelEdit();
    } catch (err) {
      console.error('Failed to save post', err);
      // reload
      fetchPosts();
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts((prev) => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post', err);
      fetchPosts();
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'white' }}>Posts</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage platform posts — edit content or remove inappropriate posts.</p>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading posts...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Author</th>
                  <th style={{ padding: '12px' }}>Created</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>No posts found.</td></tr>
                ) : posts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{String(post.id).substring(0, 8)}...</td>
                    <td style={{ padding: '12px' }}>
                      {editingId === post.id ? (
                        <input value={editingValues.title} onChange={(e) => setEditingValues(v => ({ ...v, title: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ fontWeight: 600 }}>{post.title || '(no title)'}</div>
                      )}
                      {editingId === post.id && (
                        <textarea value={editingValues.content} onChange={(e) => setEditingValues(v => ({ ...v, content: e.target.value }))} style={{ width: '100%', marginTop: '8px', padding: '8px', borderRadius: '8px' }} rows={4} />
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{post.authorName || post.author || post.userName || 'Unknown'}</td>
                    <td style={{ padding: '12px' }}>{new Date(post.createdAt || post.created_at || post.created).toLocaleString()}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {editingId === post.id ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => saveEdit(post.id)} className="btn btn-primary" style={{ padding: '8px 12px' }}><Save size={14} /> Save</button>
                          <button onClick={cancelEdit} className="btn btn-muted" style={{ padding: '8px 12px' }}><X size={14} /> Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => startEdit(post)} className="btn btn-secondary" style={{ padding: '8px 12px' }}><Edit3 size={14} /> Edit</button>
                          <button onClick={() => deletePost(post.id)} className="btn btn-danger" style={{ padding: '8px 12px' }}><Trash2 size={14} /> Delete</button>
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
