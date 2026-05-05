import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Archive, CheckCircle, AlertTriangle, Disc, Lock,
  ChevronRight, Filter, BookOpen, Layers, ChevronLeft
} from 'lucide-react';

const diffMap = {
  1: { label: 'Easy', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  2: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  3: { label: 'Hard', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  4: { label: 'Expert', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
};

const CompletedQuests = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const isPremiumUser = user?.plan === 'Premium';
  const [quests, setQuests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, allRes, sRes] = await Promise.all([
          api.get('/Quest-Attempts', { params: { limit: 100 } }),
          api.get('/QuestsFeed/all').catch(() => ({ data: [] })),
          api.get('/Subjects')
        ]);

        const attempts = qRes.data || qRes.data?.items || [];
        const allQuests = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.items || []);
        const sList = sRes.data?.subjects || sRes.data?.items || sRes.data || [];

        // Enrich attempts with metadata from the allQuests feed (which contains SubjectCode, Difficulty, etc.)
        const enrichedAttempts = attempts.map(attempt => {
          const questMetadata = allQuests.find(aq => aq.id === attempt.questId);
          return {
            ...attempt,
            subjectCode: attempt.subjectCode || questMetadata?.subjectCode || questMetadata?.subject_id,
            difficulty: attempt.difficulty || questMetadata?.difficulty || 1,
            // Fallback for title if needed
            questTitle: attempt.questTitle || questMetadata?.title || questMetadata?.questionText
          };
        });

        setQuests(enrichedAttempts);
        setSubjects(sList);
      } catch (err) {
        setError('Could not load archive.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSubjectName = (sid) => {
    if (!sid) return 'General Analysis';
    const s = subjects.find(sub => 
      (sub.id && sub.id.toString().toLowerCase() === sid.toString().toLowerCase()) || 
      (sub.code && sub.code.toString().toLowerCase() === sid.toString().toLowerCase())
    );
    return s ? s.name : 'General Analysis';
  };

  // No need for manual filtering if we use QuestAttempts endpoint, 
  // as it returns the user's mission history directly.
  const filteredQuests = selectedSubjectId === 'all'
    ? quests
    : quests.filter(q => {
      const sid = (q.subjectCode || q.subjectcode || q.subject_id || q.subjectId || '').toString().toLowerCase();
      return sid === selectedSubjectId.toLowerCase();
    });

  if (loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
      <Disc size={48} color="#6366F1" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ color: '#94A3B8', letterSpacing: '1px' }}>RETRIEVING MISSION HISTORY...</div>
    </div>
  );

  if (error) return (
    <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
      <AlertTriangle size={48} color="#EF4444" />
      <div style={{ color: '#FCA5A5' }}>{error}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="fade-in">
      <style>{`
        @keyframes spin{100%{transform:rotate(360deg)}}
        .qrow{transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);cursor:pointer;position:relative;}
        .qrow:hover{background:rgba(99,102,241,0.07)!important;border-color:rgba(99,102,241,0.3)!important;transform:translateX(6px);}
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
        .subject-badge {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6366F1;
          background: rgba(99,102,241,0.1);
          padding: 3px 10px;
          border-radius: 6px;
          margin-bottom: 6px;
          display: inline-block;
          border: 1px solid rgba(99,102,241,0.1);
        }
      `}</style>

      {/* Header & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <button 
            className="btn-link" 
            onClick={() => navigate('/quest')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', textDecoration: 'none', fontWeight: 600, marginBottom: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} /> Back to Daily Missions
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <Archive size={36} color="#6366F1" />
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>Quest Archive</h1>
          </div>
          <p style={{ color: '#64748B', margin: 0, fontSize: '1.05rem' }}>Review your past achievements and data analysis history.</p>
        </div>

        <div style={{ textAlign: 'right', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '14px 24px', borderRadius: '16px' }}>
          <div style={{ color: '#818CF8', fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{quests.length}</div>
          <div style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Total Attempts</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#E2E8F0', fontWeight: 600 }}>
          <Filter size={18} color="#6366F1" /> Filter History
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          <button
            className={`filter-btn ${selectedSubjectId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSubjectId('all')}
          >
            <Layers size={14} /> All History
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

      {/* List */}
      {filteredQuests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.05)' }}>
          <Archive size={48} color="#334155" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3 style={{ color: '#94A3B8', margin: 0 }}>No completed modules found in this discipline.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredQuests.map((q, i) => {
            const isPremiumQuest = q.isPremiumOnly === true;
            const isLockedPremium = isPremiumQuest && !isPremiumUser;
            const d = diffMap[q.difficulty] || diffMap[1];
            const subjectName = getSubjectName(q.subject_id || q.subjectId || q.subjectCode || q.subjectcode);

            const isCorrect = q.isCorrect ?? q.is_correct ?? (q.isSolved || q.is_solved);

            return (
              <div key={q.id} className="qrow slide-up"
                style={{ background: 'rgba(10,13,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '24px', animationDelay: `${i * 30}ms`, cursor: 'pointer' }}
                onClick={() => navigate(`/quest/${q.questId || q.id}`)}>

                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', 
                  background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
                  border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: isCorrect ? '#10B981' : '#EF4444', 
                  fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 
                }}>
                  {isCorrect ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="subject-badge">{subjectName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontWeight: 700, fontSize: '1.2rem',
                      color: isCorrect ? '#64748B' : '#F8FAFC',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>{q.questTitle || q.title || q.questionText || 'Archived Module'}</span>
                    {!isCorrect && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Failed</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    {d && <div style={{ background: d.bg, color: d.color, fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', border: `1px solid ${d.color}22` }}>{d.label}</div>}
                    <div style={{ color: '#F59E0B', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.5px' }}>+{q.awardedXp || 0} XP</div>
                  </div>
                  <ChevronRight size={28} color="#334155" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default CompletedQuests;
