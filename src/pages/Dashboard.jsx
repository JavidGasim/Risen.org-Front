import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Star, Trophy, ShieldAlert, ArrowRight, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const { user, stats, refreshStats } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError('');
        await refreshStats();
        // Fetch quests to show available ones
        const { data } = await api.get('/Quests');
        const items = data.quests || data.items || data || [];
        // Ensure items is an array, then slice
        if (Array.isArray(items)) {
          setQuests(items.slice(0, 3)); // show first 3 for dashboard
        } else {
          setQuests([]);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load today's quests. The server might be unreachable.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex-center fade-in" style={{ minHeight: '50vh' }}>Loading dashboard...</div>;

  const currentLeagueColor = stats?.current_league === 'Rookie' ? '#9CA3AF' :
    stats?.current_league === 'Challenger' ? '#6366F1' :
      stats?.current_league === 'Pro' ? '#10B981' :
        stats?.current_league === 'Elite' ? '#8B5CF6' : '#F59E0B'; // Legend

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }} className="fade-in">

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div className="slide-up">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Welcome back, <span className="text-gradient">{user?.name || user?.firstName || 'Engineer'}</span></h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>Here is your training for today.</p>
        </div>

        <section className="slide-up delay-100">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Today's Quests</h3>
            <Link to="/subjects" style={{ fontSize: '0.95rem', color: '#6366F1', display: 'flex', alignItems: 'center', gap: '4px' }}>
              See all <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error ? (
              <div className="glass-panel text-center" style={{ color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> {error}
              </div>
            ) : quests.length === 0 ? (
              <div className="glass-panel text-center" style={{ color: '#94A3B8', padding: '40px' }}>No quests active. Take a break!</div>
            ) : (
              quests.map((quest, index) => (
                <div key={quest.id} className={`premium-card slide-up`} style={{ animationDelay: `${(index + 2) * 100}ms`, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ paddingRight: '20px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      {quest.subject_name || 'General'} • {quest.difficulty || 'Normal'}
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#F8FAFC' }}>{quest.title}</h4>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      {quest.description?.length > 100 ? `${quest.description.substring(0, 100)}...` : quest.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontWeight: 800, color: '#F59E0B', fontSize: '1.1rem' }}>+{quest.base_xp || 0} XP</span>
                    </div>
                    <Link to={`/quest/${quest.id}`} className="btn btn-primary" style={{ padding: '12px 20px' }}>
                      Start <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Sidebar: Profile Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="slide-up delay-200">

        {/* League Panel */}
        <div className="premium-card glow-border" style={{ textAlign: 'center', position: 'relative', overflow: 'visible', padding: '32px 24px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: currentLeagueColor, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}></div>
          <Trophy size={56} color={currentLeagueColor} style={{ margin: '0 auto 16px', filter: `drop-shadow(0 0 15px ${currentLeagueColor}66)` }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.7rem', color: currentLeagueColor, textShadow: `0 0 10px ${currentLeagueColor}44` }}>{stats?.current_league || 'Rookie'} League</h3>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem' }}>Global Rank Tracking</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '20px' }}>
            <Activity size={28} color="#10B981" />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>{stats?.streak_days || 0}</div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Day Streak</div>
          </div>

          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '20px' }}>
            <Star size={28} color="#F59E0B" />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>{stats?.total_xp || 0}</div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total XP</div>
          </div>
        </div>

        {/* Risen Score Widget */}
        <div className="premium-card" style={{ background: 'linear-gradient(145deg, rgba(20,25,35,0.9) 0%, rgba(10,13,20,0.9) 100%)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <ShieldAlert size={28} color="#6366F1" />
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Risen Score</h3>
          </div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', textShadow: '0 0 25px rgba(99, 102, 241, 0.6)', lineHeight: 1 }}>
            {stats?.risen_score || '0.00'}
          </div>
          <p style={{ margin: 0, marginTop: '12px', color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Your official talent signal verified by effort and skill.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

