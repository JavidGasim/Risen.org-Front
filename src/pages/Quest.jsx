import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Target, Zap, ChevronLeft, CheckCircle } from 'lucide-react';

const Quest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshStats } = useAuth();
  
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [solution, setSolution] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const { data } = await api.get(`/Quests/${id}`);
        setQuest(data.quest);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuest();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // In a real MVP, we'd validate the solution. For now, hitting /complete
      const { data } = await api.post(`/Quests/${id}/complete`, { answer: solution });
      setSuccessData(data);
      refreshStats(); // Update context stats (league, xp, streak)
    } catch (err) {
      console.error(err);
      alert('Error completing quest.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading quest modules...</div>;
  if (!quest) return <div className="flex-center" style={{ minHeight: '50vh' }}>Quest not found.</div>;

  if (successData) {
    return (
      <div className="flex-center" style={{ minHeight: '70vh' }}>
        <div className="glass-panel animate-pulse-glow" style={{ textAlign: 'center', maxWidth: '500px', width: '100%', border: '1px solid #10B981' }}>
          <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ color: '#10B981', marginBottom: '8px' }}>Quest Completed!</h2>
          <p style={{ color: '#94A3B8', marginBottom: '24px' }}>You successfully solved: {quest.title}</p>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', marginBottom: '8px' }}>
              +{successData.earned_xp} XP
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', color: '#E2E8F0', marginTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Streak</div>
                <div style={{ fontWeight: 700 }}>{successData.new_stats.streak_days} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>League</div>
                <div style={{ fontWeight: 700, color: '#6366F1' }}>{successData.new_stats.current_league}</div>
              </div>
            </div>
          </div>
          
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#94A3B8', marginBottom: '24px' }}>
        <ChevronLeft size={16} /> Back
      </Link>
      
      <div className="glass-panel" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ color: '#6366F1', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>
              {quest.subject_name}
            </div>
            <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{quest.title}</h1>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ color: '#F59E0B', fontWeight: 800, fontSize: '1.2rem' }}>{quest.base_xp} XP</div>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem', textTransform: 'uppercase' }}>{quest.difficulty}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
            <Target size={20} color="#10B981" /> Problem Statement
          </h3>
          <p style={{ color: '#E2E8F0', lineHeight: 1.6, fontSize: '1.05rem', margin: 0 }}>
            {quest.description}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Solution / Final Answer</label>
            <input 
              type="text" 
              className="form-control" 
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter numerical answer, equation, or proof code here..."
              required
              style={{ fontSize: '1.1rem', padding: '16px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="submit" className="btn btn-success" disabled={submitting || !solution} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              <Zap size={20} /> {submitting ? 'Verifying...' : 'Submit Answer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Quest;
