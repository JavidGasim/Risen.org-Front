import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, Filter, Layers, BookOpen } from 'lucide-react';
import api from '../../utils/api';

export default function AdminQuests() {
  const [quests, setQuests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

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
      const [questsRes, subjectsRes] = await Promise.all([
        api.get('/admin/quests?limit=50'),
        api.get('/admin/subjects')
      ]);

      // Front-end filter: Hide quests that were deleted locally
      const deletedLocally = JSON.parse(localStorage.getItem('risen_deleted_quests') || '[]');
      const filteredData = Array.isArray(questsRes.data) ? questsRes.data.filter(q => !deletedLocally.includes(q.id)) : [];
      setQuests(filteredData);

      const sList = subjectsRes.data?.subjects || subjectsRes.data?.items || subjectsRes.data || [];
      setSubjects(sList);
    } catch (error) {
      console.error("Failed to fetch quests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const getSubjectName = (quest) => {
    const subjectIdOrCode = quest.subjectCode || quest.subject_id || quest.subjectId || quest.subject?.id || quest.subject?.code;

    if (subjectIdOrCode) {
      const s = subjects.find(sub => {
        if (sub.id && sub.id == subjectIdOrCode) return true;
        if (sub.code && typeof sub.code === 'string' && typeof subjectIdOrCode === 'string') {
          return sub.code.toLowerCase() === subjectIdOrCode.toLowerCase();
        }
        return sub.code == subjectIdOrCode;
      });
      if (s) return s.name;
    }

    return quest.subject?.name || quest.subject?.code || subjectIdOrCode || 'General';
  };

  const filteredSubjectsForDropdown = formData.subjectCode
    ? subjects.filter(s =>
      (s.code && s.code.toLowerCase().includes(formData.subjectCode.toLowerCase())) ||
      (s.name && s.name.toLowerCase().includes(formData.subjectCode.toLowerCase()))
    )
    : subjects;

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

      // Transform the form data to match API expectations
      const payload = {
        questionText: formData.questionText,
        description: formData.description,
        difficulty: formData.difficulty,
        subjectCode: formData.subjectCode,
        baseXp: formData.baseXp,
        isPremiumOnly: formData.isPremiumOnly,
        options: formData.options.map((text, index) => ({
          text: text,
          isCorrect: index === formData.correctOptionIndex
        }))
      };

      await api.post('/admin/quests', payload);
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
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Failed to delete", error);
          alert("Failed to deactivate quest.");
          return;
        }
      }
      // Immediately remove from UI and save to localStorage to persist the hidden state
      const deletedLocally = JSON.parse(localStorage.getItem('risen_deleted_quests') || '[]');
      if (!deletedLocally.includes(id)) {
        localStorage.setItem('risen_deleted_quests', JSON.stringify([...deletedLocally, id]));
      }
      setQuests(prev => prev.filter(q => q.id !== id));
    }
  };

  const filtered = quests.filter(q => {
    const matchesSearch = q.questionText?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesSubject = true;
    if (selectedSubjectId !== 'all') {
      const sid = q.subjectCode || q.subject_id || q.subjectId || q.subject?.id || q.subject?.code;
      const selectedSub = subjects.find(s => (s.code && s.code === selectedSubjectId) || (s.id && s.id === selectedSubjectId));

      if (!selectedSub) {
        matchesSubject = sid == selectedSubjectId || (typeof sid === 'string' && typeof selectedSubjectId === 'string' && sid.toLowerCase() === selectedSubjectId.toLowerCase());
      } else {
        const mId = selectedSub.id && sid == selectedSub.id;
        const mCode = selectedSub.code && typeof sid === 'string' && typeof selectedSub.code === 'string' && sid.toLowerCase() === selectedSub.code.toLowerCase();
        matchesSubject = mId || mCode || sid == selectedSubjectId;
      }
    }

    // Check if quest is soft-deleted or inactive
    const isNotDeleted = q.isActive !== false && q.isDeleted !== true && q.status !== 'Deleted';

    return matchesSearch && matchesSubject && isNotDeleted;
  });

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <header className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Quest Management
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Create and orchestrate gamified tasks and questions.</p>
        </div>

        <div className="admin-actions" style={{ display: 'flex', gap: '16px' }}>
          <div className="admin-search" style={{ position: 'relative', width: '300px' }}>
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

      {/* Filter Bar */}
      <style>{`
        .filter-btn {
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(15,23,42,0.4);
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #E2E8F0;
        }
        .filter-btn.active {
          background: #6366F1;
          color: #fff;
          border-color: #6366F1;
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
        }
      `}</style>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#E2E8F0', fontWeight: 600 }}>
          <Filter size={18} color="#6366F1" /> Filter by Discipline
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          <button
            className={`filter-btn ${selectedSubjectId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSubjectId('all')}
          >
            <Layers size={14} /> All Modules
          </button>
          {subjects.map(sub => {
            const subjectKey = sub.code || sub.id;
            return (
              <button
                key={subjectKey}
                className={`filter-btn ${selectedSubjectId === subjectKey ? 'active' : ''}`}
                onClick={() => setSelectedSubjectId(subjectKey)}
              >
                <BookOpen size={14} /> {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel admin-table-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading quests...</div>
        ) : (
          <div className="admin-table-scroll" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Subject</th>
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
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>
                        <span style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {getSubjectName(q)}
                        </span>
                      </td>
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
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
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
        <div className="admin-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel admin-modal" style={{ width: '100%', maxWidth: '600px', padding: '32px', borderRadius: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
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
                  value={formData.questionText} onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label className="form-label">Subject Code *</label>
                  <input
                    type="text" className="form-control" required placeholder="Search or type code..."
                    value={formData.subjectCode}
                    onChange={(e) => {
                      setFormData({ ...formData, subjectCode: e.target.value });
                      setIsSubjectDropdownOpen(true);
                    }}
                    onFocus={() => setIsSubjectDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsSubjectDropdownOpen(false), 200)}
                  />
                  {isSubjectDropdownOpen && filteredSubjectsForDropdown.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px', marginTop: '4px', maxHeight: '150px', overflowY: 'auto',
                      zIndex: 10, backdropFilter: 'blur(10px)'
                    }}>
                      {filteredSubjectsForDropdown.map(sub => (
                        <div
                          key={sub.code || sub.id}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, subjectCode: sub.code });
                            setIsSubjectDropdownOpen(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#818CF8' }}>{sub.code}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{sub.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Difficulty (1-3) *</label>
                  <input
                    type="number" min="1" max="3" className="form-control" required
                    value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'end', gap: '16px' }}>
                <div>
                  <label className="form-label">Base XP *</label>
                  <input
                    type="number" min="1" className="form-control" required
                    value={formData.baseXp} onChange={(e) => setFormData({ ...formData, baseXp: parseInt(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px' }}>
                  <input
                    type="checkbox" id="isPrem"
                    checked={formData.isPremiumOnly} onChange={(e) => setFormData({ ...formData, isPremiumOnly: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isPrem" style={{ color: 'white', cursor: 'pointer' }}>Premium Only?</label>
                </div>
              </div>

              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-control" rows={2} placeholder="Extra details..."
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      onChange={() => setFormData({ ...formData, correctOptionIndex: i })}
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
