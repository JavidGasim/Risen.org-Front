import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Plan Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: ''
  });

  // Entitlement State
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [planEntitlements, setPlanEntitlements] = useState({});
  const [loadingEntitlements, setLoadingEntitlements] = useState({});
  const [isEntitlementModalOpen, setIsEntitlementModalOpen] = useState(false);
  const [editingEntitlementId, setEditingEntitlementId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [entitlementFormData, setEntitlementFormData] = useState({
    entitlementKey: '',
    entitlementValue: '',
    description: ''
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/plans');
      const sorted = data.sort((a, b) => a.code - b.code);
      setPlans(sorted);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntitlements = async (planId) => {
    setLoadingEntitlements(prev => ({ ...prev, [planId]: true }));
    try {
      const { data } = await api.get(`/admin/plans/${planId}/entitlements`);
      setPlanEntitlements(prev => ({ ...prev, [planId]: data }));
    } catch (error) {
      console.error("Failed to fetch entitlements", error);
      setPlanEntitlements(prev => ({ ...prev, [planId]: [] }));
    } finally {
      setLoadingEntitlements(prev => ({ ...prev, [planId]: false }));
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ===== PLAN HANDLERS =====
  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingId(plan.id);
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
    setFormData({ code: '', name: '' });
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

  // ===== ENTITLEMENT HANDLERS =====
  const toggleExpandPlan = (planId) => {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
    } else {
      setExpandedPlanId(planId);
      if (!planEntitlements[planId]) {
        fetchEntitlements(planId);
      }
    }
  };

  const handleOpenEntitlementModal = (planId, entitlement = null) => {
    setSelectedPlanId(planId);
    if (entitlement) {
      setEditingEntitlementId(entitlement.id);
      setEntitlementFormData({
        entitlementKey: entitlement.entitlementKey,
        entitlementValue: entitlement.entitlementValue,
        description: entitlement.description || ''
      });
    } else {
      setEditingEntitlementId(null);
      setEntitlementFormData({
        entitlementKey: '',
        entitlementValue: '',
        description: ''
      });
    }
    setIsEntitlementModalOpen(true);
  };

  const handleCloseEntitlementModal = () => {
    setIsEntitlementModalOpen(false);
    setEditingEntitlementId(null);
    setSelectedPlanId(null);
    setEntitlementFormData({
      entitlementKey: '',
      entitlementValue: '',
      description: ''
    });
  };

  const handleSubmitEntitlement = async (e) => {
    e.preventDefault();
    try {
      if (editingEntitlementId) {
        await api.put(
          `/admin/plans/${selectedPlanId}/entitlements/${editingEntitlementId}`,
          entitlementFormData
        );
      } else {
        await api.post(
          `/admin/plans/${selectedPlanId}/entitlements`,
          entitlementFormData
        );
      }
      handleCloseEntitlementModal();
      fetchEntitlements(selectedPlanId);
    } catch (error) {
      console.error("Failed to save entitlement", error);
      alert(error.response?.data || "Error saving entitlement.");
    }
  };

  const handleDeleteEntitlement = async (planId, entitlementId, entitlementKey) => {
    if (window.confirm(`Are you sure you want to delete this entitlement: ${entitlementKey}?`)) {
      try {
        await api.delete(`/admin/plans/${planId}/entitlements/${entitlementId}`);
        fetchEntitlements(planId);
      } catch (error) {
        console.error("Failed to delete entitlement", error);
        alert("Failed to delete entitlement.");
      }
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <header className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
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

      <div className="glass-panel admin-table-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading plans...</div>
        ) : (
          <div className="admin-table-scroll" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', width: '30px' }}></th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Plan Name</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Internal Code</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length > 0 ? (
                  plans.flatMap((p) => [
                    <tr key={`plan-${p.id}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px', textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleExpandPlan(p.id)}>
                        {expandedPlanId === p.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
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
                    </tr>,
                    expandedPlanId === p.id && (
                      <tr key={`entitlements-${p.id}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan={4} style={{ padding: '24px' }}>
                          <div style={{ marginLeft: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>Plan Entitlements (Features)</h3>
                              <button
                                onClick={() => handleOpenEntitlementModal(p.id)}
                                style={{ padding: '6px 12px', background: '#6366F1', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                              >
                                <Plus size={16} /> Add Entitlement
                              </button>
                            </div>

                            {loadingEntitlements[p.id] ? (
                              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '16px' }}>Loading entitlements...</div>
                            ) : (planEntitlements[p.id]?.length > 0 ? (
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                      <th style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'left', fontSize: '12px' }}>Key</th>
                                      <th style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'left', fontSize: '12px' }}>Value</th>
                                      <th style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'left', fontSize: '12px' }}>Description</th>
                                      <th style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right', fontSize: '12px' }}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {planEntitlements[p.id].map((e) => (
                                      <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace', fontSize: '12px' }}>{e.entitlementKey}</td>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace', fontSize: '12px' }}>{e.entitlementValue}</td>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{e.description || '-'}</td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                              onClick={() => handleOpenEntitlementModal(p.id, e)}
                                              style={{ padding: '4px', background: 'transparent', border: 'none', color: '#6366F1', cursor: 'pointer' }}
                                              title="Edit"
                                            >
                                              <Edit2 size={16} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteEntitlement(p.id, e.id, e.entitlementKey)}
                                              style={{ padding: '4px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                              title="Delete"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '16px', fontSize: '12px' }}>No entitlements yet. Click "Add Entitlement" to create one.</div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  ])
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
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
        <div className="admin-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel admin-modal" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '24px', position: 'relative' }}>
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
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Free Tier"
                />
              </div>
              <div>
                <label className="form-label">Plan Code *</label>
                <input
                  type="text" className="form-control" required
                  value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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

      {isEntitlementModalOpen && (
        <div className="admin-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel admin-modal" style={{ width: '100%', maxWidth: '450px', padding: '32px', borderRadius: '24px', position: 'relative' }}>
            <button
              onClick={handleCloseEntitlementModal}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              {editingEntitlementId ? 'Edit Entitlement' : 'Add Entitlement'}
            </h2>

            <form onSubmit={handleSubmitEntitlement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Entitlement Key *</label>
                <input
                  type="text" className="form-control" required disabled={!!editingEntitlementId}
                  value={entitlementFormData.entitlementKey} 
                  onChange={(e) => setEntitlementFormData({ ...entitlementFormData, entitlementKey: e.target.value })}
                  placeholder="e.g. max_quests_per_day"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Unique identifier for this feature (cannot be changed).
                </p>
              </div>
              <div>
                <label className="form-label">Entitlement Value *</label>
                <input
                  type="text" className="form-control" required
                  value={entitlementFormData.entitlementValue} 
                  onChange={(e) => setEntitlementFormData({ ...entitlementFormData, entitlementValue: e.target.value })}
                  placeholder="e.g. unlimited, 5, true"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  The value for this entitlement (e.g., limit number, true/false, or text).
                </p>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control" rows="3"
                  value={entitlementFormData.description} 
                  onChange={(e) => setEntitlementFormData({ ...entitlementFormData, description: e.target.value })}
                  placeholder="Describe what this entitlement provides..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={handleCloseEntitlementModal} style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                  {editingEntitlementId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
