import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Target, Zap, ChevronLeft, CheckCircle, AlertTriangle, Disc } from 'lucide-react';

const Quest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshStats } = useAuth();
  
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [solution, setSolution] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        setError('');
        const { data } = await api.get(`/Quests/${id}`);
        setQuest(data.quest || data.item || data);
      } catch (err) {
        console.error(err);
        setError("Could not load quest data. The server might be unreachable.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuest();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post(`/Quests/${id}/complete`, { answer: solution });
      setSuccessData(data);
      refreshStats(); // Update context stats (league, xp, streak)
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Verification failed. Incorrect answer or system error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
      <Disc size={48} color="#10B981" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      <div style={{ color: '#94A3B8', fontSize: '1.2rem', letterSpacing: '1px' }}>DECRYPTING MODULES...</div>
    </div>
  );
  
  if (!quest && !loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
      <AlertTriangle size={48} color="#EF4444" />
      <div style={{ fontSize: '1.2rem' }}>{error || 'Quest not found.'}</div>
      <Link to="/subjects" className="btn btn-outline" style={{ marginTop: '16px' }}>Return to Subjects</Link>
    </div>
  );

  if (successData) {
    return (
      <div className="flex-center fade-in" style={{ minHeight: '70vh' }}>
        <div className="premium-card glow-border" style={{ textAlign: 'center', maxWidth: '550px', width: '100%', padding: '48px 32px' }}>
          <CheckCircle size={80} color="#10B981" className="slide-up" style={{ margin: '0 auto 24px', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.5))' }} />
          <h2 className="slide-up delay-100" style={{ color: '#F8FAFC', marginBottom: '8px', fontSize: '2.5rem' }}>Quest Completed!</h2>
          <p className="slide-up delay-100" style={{ color: '#10B981', marginBottom: '32px', fontSize: '1.1rem', fontWeight: 500 }}>Target neutralized effectively.</p>
          
          <div className="slide-up delay-200" style={{ background: 'rgba(0,0,0,0.4)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '32px' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#F59E0B', marginBottom: '16px', textShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
              +{successData.earned_xp || quest.base_xp || 0} XP
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', color: '#E2E8F0', marginTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Streak</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{successData.new_stats?.streak_days || 1} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>League</div>
                <div style={{ fontWeight: 800, color: '#6366F1', fontSize: '1.2rem' }}>{successData.new_stats?.current_league || 'Rookie'}</div>
              </div>
            </div>
          </div>
          
          <Link to="/dashboard" className="btn btn-primary slide-up delay-300" style={{ width: '100%', padding: '16px' }}>
            Return to Command Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }} className="fade-in">
      <Link to="/subjects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94A3B8', marginBottom: '32px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color='#fff'} onMouseLeave={(e) => e.currentTarget.style.color='#94A3B8'}>
        <ChevronLeft size={18} /> Back Archive
      </Link>
      
      <div className="premium-card slide-up" style={{ padding: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <div style={{ color: '#6366F1', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
              {quest.subject_name || 'General Engineering'}
            </div>
            <h1 style={{ margin: 0, fontSize: '3rem', lineHeight: 1.1, textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>{quest.title}</h1>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(245, 158, 11, 0.1)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 0 20px rgba(245,158,11,0.05) inset' }}>
            <div style={{ color: '#F59E0B', fontWeight: 800, fontSize: '1.5rem' }}>{quest.base_xp || 0} XP</div>
            <div style={{ color: '#94A3B8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{quest.difficulty || 'Normal'}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(5, 7, 10, 0.6)', padding: '32px', borderRadius: '16px', borderLeft: '4px solid #10B981', marginBottom: '40px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: '#F8FAFC', fontSize: '1.3rem' }}>
            <Target size={24} color="#10B981" /> Problem Statement
          </h3>
          <p style={{ color: '#E2E8F0', lineHeight: 1.8, fontSize: '1.15rem', margin: 0, whiteSpace: 'pre-line', fontFamily: '"Georgia", serif', letterSpacing: '0.3px' }}>
            {quest.description}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group slide-up delay-100">
            <label className="form-label" style={{ fontSize: '1rem', color: '#E2E8F0', marginBottom: '12px' }}>Your Solution / Final Answer</label>
            <input 
              type="text" 
              className="form-control" 
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter numerical answer, equation, or proof code here..."
              required
              style={{ fontSize: '1.2rem', padding: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(99,102,241,0.3)' }}
              onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.4)'}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>

          {error && (
            <div className="fade-in" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#FCA5A5', borderRadius: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} />
              <div>{error}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }} className="slide-up delay-200">
            <button type="submit" className={`btn ${submitting ? 'btn-outline' : 'btn-success'}`} disabled={submitting || !solution} style={{ padding: '16px 40px', fontSize: '1.2rem', minWidth: '220px' }}>
              {submitting ? (
                 <><Disc size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
              ) : (
                 <><Zap size={20} /> Submit Answer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Quest;
