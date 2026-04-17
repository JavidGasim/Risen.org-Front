import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { BookOpen, Zap, ArrowRight, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
        const [subRes, questRes] = await Promise.all([
          api.get('/Subjects'),
          api.get('/Quests')
        ]);
        
        const subs = subRes.data?.subjects || subRes.data?.items || subRes.data || [];
        const qs = questRes.data?.quests || questRes.data?.items || questRes.data || [];

        setSubjects(Array.isArray(subs) ? subs : []);
        setQuests(Array.isArray(qs) ? qs : []);
      } catch (err) {
        console.error("Failed to load subjects or quests", err);
        setError("We couldn't load the subjects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex-center fade-in" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
    <BookOpen size={48} color="#6366F1" className="animate-pulse-glow" style={{ borderRadius: '50%' }} />
    <div style={{ color: '#94A3B8', fontSize: '1.1rem', fontWeight: 500 }}>Loading subjects...</div>
  </div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }} className="fade-in">
      <div style={{ textAlign: 'center' }} className="slide-up">
        <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <BookOpen size={40} color="#6366F1" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>My <span className="text-gradient">Learning</span></h1>
        <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>Select a subject and tackle the active quests to build your score.</p>
      </div>

      {error && (
        <div className="slide-up delay-100" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
          <AlertCircle size={24} /> <span>{error}</span>
        </div>
      )}

      {!error && subjects.length === 0 && (
        <div className="slide-up delay-100 text-center" style={{ padding: '60px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', color: '#94A3B8' }}>
          No subjects are currently available. Check back soon.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {subjects.map((subject, index) => {
          const subjectQuests = quests.filter(q => q.subject_id === subject.id);
          const isExpanded = expandedSubject === subject.id;
          
          return (
            <div 
              key={subject.id} 
              className={`premium-card slide-up glow-border`} 
              style={{ animationDelay: `${(index + 2) * 100}ms`, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '24px', flex: 1, cursor: 'pointer' }} onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#F8FAFC' }}>{subject.name}</h3>
                  {isExpanded ? <ChevronUp size={20} color="#94A3B8" /> : <ChevronDown size={20} color="#94A3B8" />}
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{subject.description}</p>
                
                <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '6px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Zap size={14} /> {subjectQuests.length} Active Quests
                </div>
              </div>
              
              <div 
                style={{ 
                  background: 'rgba(0,0,0,0.4)', 
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  maxHeight: isExpanded ? '500px' : '0',
                  opacity: isExpanded ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ padding: '20px 24px' }}>
                  {subjectQuests.length === 0 ? (
                    <div style={{ fontSize: '0.9rem', color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' }}>You have completed all current quests here.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {subjectQuests.map(q => (
                        <Link 
                          key={q.id} 
                          to={`/quest/${q.id}`}
                          className="btn-outline"
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.95rem', color: '#E2E8F0', fontWeight: 600 }}>{q.title}</span>
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{q.difficulty} • +{q.base_xp} XP</span>
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
