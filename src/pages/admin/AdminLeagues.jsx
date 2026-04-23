import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

export default function AdminLeagues() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    minXp: 0,
    maxXp: 0,
    sortOrder: 1,
    weight: 1.0
  });

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/league-tiers');
      setLeagues(data);
    } catch (error) {
      console.error("Failed to fetch league tiers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const handleOpenModal = (league = null) => {
    if (league) {
      setEditingId(league.id);
      setFormData({
        code: league.code || '',
        name: league.name || '',
        minXp: league.minXp || 0,
        maxXp: league.maxXp || 0,
        sortOrder: league.sortOrder || 1,
        weight: league.weight || 1.0
      });
    } else {
      setEditingId(null);
      setFormData({ code: '', name: '', minXp: 0, maxXp: 0, sortOrder: 1, weight: 1.0 }); 
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
        await api.put(`/admin/league-tiers/${editingId}`, formData);
      } else {
        await api.post('/admin/league-tiers', formData);
      }
      handleCloseModal();
      fetchLeagues();
    } catch (error) {
      console.error("Failed to save league tier", error);
      alert(error.response?.data?.message || typeof error.response?.data === 'string' ? error.response?.data : "Error saving league tier.");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/admin/league-tiers/${id}`);
        fetchLeagues();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete league tier.");
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            League Tiers
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Define gamified progression ranks based on total XP.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add League Tier
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading league tiers...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Tier Name</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>XP Range</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Multipliers</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leagues.length > 0 ? (
                  leagues.sort((a,b) => a.sortOrder - b.sortOrder).map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>
                        {l.name}
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{l.code}</div>
                      </td>
                      <td style={{ padding: '16px', color: '#10b981', fontWeight: '500' }}>
                        {l.minXp} - {l.maxXp} XP
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '13px' }}>
                          w: {l.weight}x
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenModal(l)}
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#6366F1', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(l.id, l.name)}
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
                      No league tiers mapped.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              {editingId ? 'Edit League Tier' : 'Add League Tier'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
                <div>
                  <label className="form-label">Name *</label>
                  <input 
                    type="text" className="form-control" required
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Gold Tier"
                  />
                </div>
                <div>
                  <label className="form-label">Internal Code *</label>
                  <input 
                    type="text" className="form-control" required disabled={!!editingId}
                    value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. GOLD"
                    style={{ opacity: editingId ? 0.6 : 1 }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Min XP</label>
                  <input 
                    type="number" className="form-control" required min="0"
                    value={formData.minXp} onChange={(e) => setFormData({...formData, minXp: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="form-label">Max XP</label>
                  <input 
                    type="number" className="form-control" required min="0"
                    value={formData.maxXp} onChange={(e) => setFormData({...formData, maxXp: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Sort Order *</label>
                  <input 
                    type="number" className="form-control" required min="1"
                    value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="form-label">Multiplier Weight *</label>
                  <input 
                    type="number" step="0.1" className="form-control" required min="0.1"
                    value={formData.weight} onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})}
                    placeholder="e.g. 1.5"
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
