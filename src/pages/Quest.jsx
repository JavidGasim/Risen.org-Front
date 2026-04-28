import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Target, CheckCircle, AlertTriangle, Disc, Lock, 
  ChevronRight, Filter, BookOpen, Layers
} from 'lucide-react';

const diffMap = {
  1: { label: 'Easy',   color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  2: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  3: { label: 'Hard',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
  4: { label: 'Expert', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
};

const Quest = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          api.get('/QuestsFeed/all', { params: { limit: 100 } }),
          api.get('/Subjects')
        ]);
        
        const qList = Array.isArray(qRes.data) ? qRes.data : (qRes.data.items || []);
        const sList = sRes.data?.subjects || sRes.data?.items || sRes.data || [];
        
        setQuests(qList);
        setSubjects(sList);
      } catch (err) {
        setError('Could not load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSubjectName = (subjectId) => {
    const s = subjects.find(sub => sub.id === subjectId);
    return s ? s.name : 'General';
  };

  const filteredQuests = selectedSubjectId === 'all' 
    ? quests 
    : quests.filter(q => (q.subject_id || q.subjectId) === selectedSubjectId);

  if (loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
      <Disc size={48} color="#10B981" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ color: '#94A3B8', letterSpacing: '1px' }}>SYNCHRONIZING ARCHIVE...</div>
    </div>
  );

  if (error) return (
    <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
      <AlertTriangle size={48} color="#EF4444" />
      <div style={{ color: '#FCA5A5' }}>{error}</div>
    </div>
  );

  const completed = quests.filter(q => q.isCompletedToday || q.isCompleted || q.alreadyCompletedEver || q.isSolved || q.is_solved).length;

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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'8px' }}>
            <Target size={36} color="#6366F1" />
            <h1 style={{ margin:0, fontSize:'2.5rem', fontWeight:800 }}>Quest Modules</h1>
          </div>
          <p style={{ color:'#64748B', margin:0, fontSize: '1.05rem' }}>Access prioritized training data and earn XP rewards.</p>
        </div>
        
        <div style={{ textAlign:'right', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', padding:'14px 24px', borderRadius:'16px' }}>
          <div style={{ color:'#10B981', fontSize:'1.8rem', fontWeight:800, lineHeight: 1 }}>{completed}/{quests.length}</div>
          <div style={{ color:'#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Status: Ready</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: '32px' }}>
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
          {subjects.map(sub => (
            <button 
              key={sub.id}
              className={`filter-btn ${selectedSubjectId === sub.id ? 'active' : ''}`}
              onClick={() => setSelectedSubjectId(sub.id)}
            >
              <BookOpen size={14} /> {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredQuests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.05)' }}>
          <Disc size={48} color="#334155" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3 style={{ color: '#94A3B8', margin: 0 }}>No modules found in this discipline.</h3>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap: '14px' }}>
          {filteredQuests.map((q, i) => (
            <div key={q.id} className="qrow slide-up"
              style={{ background:'rgba(10,13,20,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'24px 32px', display:'flex', alignItems:'center', gap:'24px', animationDelay:`${i*30}ms` }}
              onClick={() => navigate(`/quest/${q.id}`)}>
              
              {/* Robust completion check */}
              {(() => {
                 const isDone = (
                   q.isCompletedToday === true || 
                   q.isCompleted === true || 
                   q.isCompletedEver === true ||
                   q.alreadyCompletedEver === true || 
                   q.already_completed_ever === true ||
                   q.isSolved === true ||
                   q.is_completed === true ||
                   (q.completedDateUtc !== undefined && q.completedDateUtc !== null) ||
                   (q.userSelectedOptionIndex !== undefined && q.userSelectedOptionIndex !== null) ||
                   (q.userAnswerIndex !== undefined && q.userAnswerIndex !== null) ||
                   (q.selectedOptionIndex !== undefined && q.selectedOptionIndex !== null)
                 );
                 
                 const d = diffMap[q.difficulty] || diffMap[1];
                 const subjectName = getSubjectName(q.subject_id || q.subjectId);

                 return (
                   <>
                      <div style={{ width:'48px', height:'48px', borderRadius:'14px', background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'rgba(99,102,241,0.08)', border: isDone ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color: isDone ? '#10B981' : '#818CF8', fontWeight:900, fontSize:'1.1rem', flexShrink:0 }}>
                        {isDone ? <CheckCircle size={20} /> : i + 1}
                      </div>

                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="subject-badge">{subjectName}</div>
                        <div style={{ display:'flex', alignItems:'center', gap: '12px' }}>
                          <span style={{ 
                            fontWeight:700, fontSize: '1.2rem', 
                            color: isDone ? '#64748B' : '#F8FAFC', 
                            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' 
                          }}>{q.title}</span>
                          {q.isPremiumOnly && <Lock size={14} color="#F59E0B" />}
                        </div>
                      </div>

                      <div style={{ display:'flex', alignItems:'center', gap:'24px', flexShrink:0 }}>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ background:d.bg, color:d.color, fontSize:'0.7rem', fontWeight:800, padding:'3px 12px', borderRadius:'20px', textTransform:'uppercase', letterSpacing:'1px', marginBottom: '6px', border: `1px solid ${d.color}22` }}>{d.label}</div>
                           <div style={{ color:'#F59E0B', fontWeight:900, fontSize:'1.1rem', letterSpacing: '0.5px' }}>+{q.baseXp || q.xpReward || 0} XP</div>
                        </div>
                        {isDone ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={28} color="#10B981" style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.3))' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>Done</span>
                          </div>
                        ) : (
                          <ChevronRight size={28} color="#334155" />
                        )}
                      </div>
                   </>
                 );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quest;
