import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

export default function AdminQuests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    description: '',
    difficulty: 1, // Range 1-3 usually (Easy, Medium, Hard)
    subjectCode: '',
    baseXp: 10,
    isPremiumOnly: false,
    correctOptionIndex: 0,
    options: ['', '', '', '', ''] // API explicitly requires exactly 5 options
  });

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/quests?limit=50');
      setQuests(data);
    } catch (error) {
      console.error("Failed to fetch quests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      questionText: '',
      description: '',
      difficulty: 1,
      subjectCode: '',
      baseXp: 10,
      isPremiumOnly: false,
      correctOptionIndex: 0,
      options: ['', '', '', '', '']
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOptionChange = (idx, val) => {
    const newOptions = [...formData.options];
    newOptions[idx] = val;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.options.some(opt => !opt.trim())) {
        alert("All 5 options must be filled.");
        return;
      }

      await api.post('/admin/quests', formData);
      handleCloseModal();
      fetchQuests();
    } catch (error) {
      console.error("Failed to save quest", error);
      alert(error.response?.data?.message || typeof error.response?.data === 'string' ? error.response?.data : "Failed to create quest");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to deactivate this quest?`)) {
      try {
        await api.delete(`/admin/quests/${id}`);
        fetchQuests();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to deactivate quest.");
      }
    }
  };

  const filtered = quests.filter(q => 
    q.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Quest Management
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Create and orchestrate gamified tasks and questions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search quests..."
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
            onClick={handleOpenModal}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> New Quest
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading quests...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Question Content</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Base XP</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Total Options</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((q) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px', fontWeight: '500', color: 'white', maxWidth: '400px' }}>
                        {q.questionText}
                      </td>
                      <td style={{ padding: '16px', color: '#10b981', fontWeight: 'bold' }}>
                        +{q.xpReward || q.baseXp || 10} XP
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>
                        {q.options?.length || 0} variants
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleDelete(q.id)}
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            title="Deactivate Quest"
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
                      No quests found.
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', borderRadius: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              Create New Quest
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Question Text *</label>
                <textarea 
                  className="form-control" required rows={2}
                  value={formData.questionText} onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
                <div>
                  <label className="form-label">Subject Code *</label>
                  <input 
                    type="text" className="form-control" required placeholder="e.g. MATH101"
                    value={formData.subjectCode} onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Difficulty (1-3) *</label>
                  <input 
                    type="number" min="1" max="3" className="form-control" required
                    value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'end', gap: '16px' }}>
                <div>
                  <label className="form-label">Base XP *</label>
                  <input 
                    type="number" min="1" className="form-control" required
                    value={formData.baseXp} onChange={(e) => setFormData({...formData, baseXp: parseInt(e.target.value)})}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px' }}>
                  <input 
                    type="checkbox" id="isPrem"
                    checked={formData.isPremiumOnly} onChange={(e) => setFormData({...formData, isPremiumOnly: e.target.checked})}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isPrem" style={{ color: 'white', cursor: 'pointer' }}>Premium Only?</label>
                </div>
              </div>

              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea 
                  className="form-control" rows={2} placeholder="Extra details..."
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Provide Exactly 5 Options *</label>
                {formData.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '12px' }}>
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={formData.correctOptionIndex === i}
                      onChange={() => setFormData({...formData, correctOptionIndex: i})}
                      style={{ cursor: 'pointer' }}
                      title="Mark as correct answer"
                    />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={`Option ${i + 1}`}
                      required 
                      value={opt} 
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                    />
                  </div>
                ))}
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                  Select the radio button next to the correct answer.
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                  Create Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
