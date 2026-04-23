import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: ''
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/plans');
      setPlans(data);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingId(plan.id);
      // Wait, Plan Code might come back as numeric from enum or as string depending on serialization.
      // Usually, ASP.NET Core returns enum as integer unless configured with StringEnumConverter.
      setFormData({
        code: plan.code?.toString() || '',
        name: plan.name || ''
      });
    } else {
      setEditingId(null);
      setFormData({ code: 'Free', name: '' }); 
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
        await api.put(`/admin/plans/${editingId}`, formData);
      } else {
        await api.post('/admin/plans', formData);
      }
      handleCloseModal();
      fetchPlans();
    } catch (error) {
      console.error("Failed to save plan", error);
      alert(error.response?.data?.message || typeof error.response?.data === 'string' ? error.response?.data : "Error saving plan.");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the plan: ${name}?`)) {
      try {
        await api.delete(`/admin/plans/${id}`);
        fetchPlans();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete plan.");
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Subscription Plans
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage membership tiers (Free, Premium, etc).</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add Plan
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading plans...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Plan Name</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Internal Code</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length > 0 ? (
                  plans.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>
                        {p.name}
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>
                        {p.code}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenModal(p)}
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#6366F1', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
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
                    <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                      No subscription plans found.
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '24px', position: 'relative' }}>
            <button 
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              {editingId ? 'Edit Plan' : 'Add Plan'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Plan Name *</label>
                <input 
                  type="text" className="form-control" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Free Tier"
                />
              </div>
              <div>
                <label className="form-label">Plan Code *</label>
                <input 
                  type="text" className="form-control" required
                  value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. Free, Premium"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Must precisely match a C# PlanCode enum literal.
                </p>
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
