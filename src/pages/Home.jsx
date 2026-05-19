import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Globe, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/Subjects');
        const list = data?.subjects || data?.items || data || [];
        setSubjects(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load home subjects', err);
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', gap: '80px' }}>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, margin: '0 auto', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          The Global Standard for Engineering Skill
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-1px' }}>
          Prove your <span className="text-gradient">consistency.</span><br />
          Rise through <span className="text-gradient">leagues.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
          Duolingo for engineering — but with leagues, rankings, and real academic signal. Learn by doing, not memorizing.
        </p>
        {!isAuthenticated && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
            <Link to="/register" className="btn btn-success" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              Join the League <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </section>

      {/* Philosophy / Features grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Activity size={32} color="#6366F1" />
          <h3 style={{ fontSize: '1.5rem' }}>Daily Actions &gt; Big Wins</h3>
          <p style={{ color: '#94A3B8' }}>Build a streak by cracking engineering problems daily. Long-term performance tracking over one-off exams.</p>
        </div>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Shield size={32} color="#10B981" />
          <h3 style={{ fontSize: '1.5rem' }}>League Progression</h3>
          <p style={{ color: '#94A3B8' }}>Start as a Rookie and rise to Legend. Your league signifies your consistency and effort to universities worldwide.</p>
        </div>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Globe size={32} color="#F59E0B" />
          <h3 style={{ fontSize: '1.5rem' }}>Risen Score</h3>
          <p style={{ color: '#94A3B8' }}>A verifiable talent signal that transcends borders and grading curves. Fair, transparent, and purely effort-based.</p>
        </div>
      </section>

      {/* Sample Subjects */}
      <section style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '60px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px' }}>Master the core disciplines</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {subjectsLoading ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)', color: '#94A3B8' }}>
              Loading disciplines...
            </div>
          ) : subjects.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)', color: '#94A3B8' }}>
              No disciplines available yet.
            </div>
          ) : subjects.map((subject) => (
            <div key={subject.id || subject.code || subject.name} className="glass-panel" style={{ textAlign: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)' }}>
              <h4 style={{ margin: 0, color: '#E2E8F0' }}>{subject.name}</h4>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
