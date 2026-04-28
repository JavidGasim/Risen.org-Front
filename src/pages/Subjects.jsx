import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  BookOpen, Zap, ArrowRight, AlertCircle, 
  ChevronDown, ChevronUp, Layers, Target 
} from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setError('');
        // Subjects uses /Subjects, Quests uses QuestsFeed/all which we know works
        const [subRes, questRes] = await Promise.all([
          api.get('/Subjects'),
          api.get('/QuestsFeed/all', { params: { limit: 100 } })
        ]);
        
        const subs = subRes.data?.subjects || subRes.data?.items || subRes.data || [];
        const qs = Array.isArray(questRes.data) ? questRes.data : (questRes.data?.items || questRes.data?.quests || []);

        setSubjects(Array.isArray(subs) ? subs : []);
        setQuests(Array.isArray(qs) ? qs : []);
      } catch (err) {
        console.error("Failed to load subjects or quests", err);
        setError("Synchronization failed. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
      <Layers size={48} color="#6366F1" className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
      <div style={{ color: '#94A3B8', fontSize: '1.1rem', letterSpacing: '1px' }}>RETRIVING SUBJECTS...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }} className="fade-in">
      <div style={{ textAlign: 'center' }} className="slide-up">
        <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <BookOpen size={40} color="#6366F1" />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px' }}>Course <span className="text-gradient">Catalog</span></h1>
        <p style={{ color: '#94A3B8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Navigate through disciplines and master active quest modules.</p>
      </div>

      {error && (
        <div className="slide-up" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
          <AlertCircle size={24} /> <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
        {subjects.map((subject, index) => {
          const subjectQuests = quests.filter(q => (q.subject_id || q.subjectId) === subject.id);
          const isExpanded = expandedSubject === subject.id;
          
          return (
            <div 
              key={subject.id} 
              className="premium-card slide-up" 
              style={{ 
                animationDelay: `${(index) * 80}ms`, 
                display: 'flex', 
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                border: isExpanded ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div 
                style={{ padding: '32px', cursor: 'pointer', transition: 'background 0.2s' }} 
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#F8FAFC', fontWeight: 800 }}>{subject.name}</h3>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '12px' }}>
                    {isExpanded ? <ChevronUp size={20} color="#6366F1" /> : <ChevronDown size={20} color="#94A3B8" />}
                  </div>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, margin: 0, opacity: 0.8 }}>
                  {subject.description || 'Comprehensive study module focusing on advanced principles and practical applications.'}
                </p>
                
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                    <Zap size={14} /> {subjectQuests.length} Modules
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    LEVEL 01
                  </div>
                </div>
              </div>
              
              <div 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  maxHeight: isExpanded ? '600px' : '0',
                  opacity: isExpanded ? 1 : 0,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderTop: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}
              >
                <div style={{ padding: '24px' }}>
                  {subjectQuests.length === 0 ? (
                    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <Target size={24} color="#334155" style={{ marginBottom: '8px' }} />
                      <div style={{ fontSize: '0.9rem', color: '#475569' }}>No active modules in this archive.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {subjectQuests.map(q => (
                        <Link 
                          key={q.id} 
                          to={`/quest/${q.id}`}
                          style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '16px 20px', borderRadius: '14px', 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s', textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '1rem', color: '#F1F5F9', fontWeight: 700 }}>{q.title}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800 }}>+{q.baseXp || q.xpReward || 0} XP • SECURED</span>
                          </div>
                          <ArrowRight size={18} color="#6366F1" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subjects;
