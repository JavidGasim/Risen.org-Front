import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

export default function AdminUniversities() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    stateProvince: '',
    primaryDomain: '',
    primaryWebPage: ''
  });

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/universities?limit=500');
      setUniversities(data);
    } catch (error) {
      console.error("Failed to fetch universities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleOpenModal = (uni = null) => {
    if (uni) {
      setEditingId(uni.id);
      setFormData({
        name: uni.name || '',
        country: uni.country || '',
        stateProvince: uni.stateProvince || '',
        primaryDomain: uni.primaryDomain || '',
        primaryWebPage: uni.primaryWebPage || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', country: '', stateProvince: '', primaryDomain: '', primaryWebPage: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/universities/${editingId}`, formData);
      } else {
        await api.post('/admin/universities', formData);
      }
      handleCloseModal();
      fetchUniversities();
    } catch (error) {
      console.error("Failed to save university", error);
      alert("Error saving university.");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/universities/${id}`);
        fetchUniversities();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete university.");
      }
    }
  };

  const filtered = universities.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Universities
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage registered academic institutions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add University
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading universities...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Location</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Domain</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontWeight: '600', color: 'white' }}>{u.name}</p>
                        {u.primaryWebPage && (
                           <a href={u.primaryWebPage} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#6366F1', textDecoration: 'none' }}>
                             {u.primaryWebPage}
                           </a>
                        )}
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>
                        {u.country} {u.stateProvince ? `- ${u.stateProvince}` : ''}
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                        {u.primaryDomain || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenModal(u)}
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#6366F1', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                      No universities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', borderRadius: '24px', position: 'relative' }}>
            <button 
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              {editingId ? 'Edit University' : 'Add University'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">University Name *</label>
                <input 
                  type="text" className="form-control" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Country</label>
                  <input 
                    type="text" className="form-control"
                    value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">State/Province</label>
                  <input 
                    type="text" className="form-control"
                    value={formData.stateProvince} onChange={(e) => setFormData({...formData, stateProvince: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Primary Domain</label>
                  <input 
                    type="text" className="form-control" placeholder="e.g. mit.edu"
                    value={formData.primaryDomain} onChange={(e) => setFormData({...formData, primaryDomain: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Website</label>
                  <input 
                    type="text" className="form-control" placeholder="https://..."
                    value={formData.primaryWebPage} onChange={(e) => setFormData({...formData, primaryWebPage: e.target.value})}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
