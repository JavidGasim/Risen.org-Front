import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Check, XCircle } from 'lucide-react';
import api from '../../utils/api';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/subjects');
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenModal = (sub = null) => {
    if (sub) {
      setEditingCode(sub.code);
      setFormData({
        code: sub.code || '',
        name: sub.name || '',
        description: sub.description || '',
        isActive: sub.isActive !== undefined ? sub.isActive : true
      });
    } else {
      setEditingCode(null);
      setFormData({ code: '', name: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCode(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive
      };
      
      if (editingCode) {
        await api.put(`/admin/subjects/${editingCode}`, payload);
      } else {
        await api.post('/admin/subjects', payload);
      }
      handleCloseModal();
      fetchSubjects();
    } catch (error) {
      console.error("Failed to save subject", error);
      const msg = error.response?.data?.message || typeof error.response?.data === 'string' ? error.response?.data : "Error saving subject.";
      alert(msg);
    }
  };

  const handleDelete = async (code, name) => {
    if (window.confirm(`Are you sure you want to deactivate ${name} (${code})?`)) {
      try {
        await api.delete(`/admin/subjects/${code}`);
        fetchSubjects();
      } catch (error) {
        console.error("Failed to deactivate", error);
        alert("Failed to deactivate subject.");
      }
    }
  };

  const filtered = subjects.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Subjects
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Define and manage the curriculum subjects.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search subjects..."
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
            <Plus size={18} /> Add Subject
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading subjects...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Code</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Subject Name</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Description</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', opacity: s.isActive ? 1 : 0.5 }}>
                      <td style={{ padding: '16px', fontFamily: 'monospace', color: '#8B5CF6', fontWeight: 'bold' }}>
                        {s.code.toUpperCase()}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600' }}>
                        {s.name}
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.6)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.description || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {s.isActive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                            <Check size={14} /> Active
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                            <XCircle size={14} /> Inactive
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenModal(s)}
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#6366F1', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          {s.isActive && (
                            <button
                                onClick={() => handleDelete(s.code, s.name)}
                                style={{ padding: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                title="Deactivate"
                            >
                                <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                      No subjects found.
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
              {editingCode ? 'Edit Subject' : 'Add Subject'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Subject Code * (e.g., MATH101)</label>
                <input 
                  type="text" className="form-control" required 
                  disabled={!!editingCode} // Cannot change code once created
                  value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  style={{ opacity: editingCode ? 0.6 : 1 }}
                />
              </div>
              <div>
                <label className="form-label">Name *</label>
                <input 
                  type="text" className="form-control" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" rows={3}
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="isActive" style={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}>
                  Mark as Active
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                  {editingCode ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
