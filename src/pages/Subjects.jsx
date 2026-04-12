import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { BookOpen, Zap, ArrowRight } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [subRes, questRes] = await Promise.all([
          api.get('/Subjects'),
          api.get('/Quests')
        ]);
        setSubjects(subRes.data.subjects);
        setQuests(questRes.data.quests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading subjects...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div style={{ textAlign: 'center' }}>
        <BookOpen size={48} color="#6366F1" style={{ margin: '0 auto 16px' }} />
        <h1>My Learning</h1>
        <p style={{ color: '#94A3B8' }}>Select a subject and tackle the active quests.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {subjects.map(subject => {
          const subjectQuests = quests.filter(q => q.subject_id === subject.id);
          
          return (
            <div key={subject.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{subject.name}</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', flex: 1 }}>{subject.description}</p>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Zap size={14} /> Active Quests ({subjectQuests.length})
                </h4>
                {subjectQuests.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>No quests currently available.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {subjectQuests.map(q => (
                      <Link 
                        key={q.id} 
                        to={`/quest/${q.id}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <span style={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: 500 }}>{q.title}</span>
                        <ArrowRight size={14} color="#6366F1" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subjects;
