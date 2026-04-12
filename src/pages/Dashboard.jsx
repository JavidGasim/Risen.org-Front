import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Star, Trophy, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const { user, stats, refreshStats } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await refreshStats();
        // Fetch quests to show available ones
        const { data } = await api.get('/Quests');
        setQuests(data.quests.slice(0, 3)); // show first 3 for dashboard
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading dashboard...</div>;

  const currentLeagueColor = stats?.current_league === 'Rookie' ? '#9CA3AF' : 
                             stats?.current_league === 'Challenger' ? '#6366F1' : 
                             stats?.current_league === 'Pro' ? '#10B981' :
                             stats?.current_league === 'Elite' ? '#8B5CF6' : '#F59E0B'; // Legend

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
      
      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2>Welcome back, {user?.name}</h2>
          <p style={{ color: '#94A3B8' }}>Here is your training for today.</p>
        </div>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Today's Quests</h3>
            <Link to="/subjects" style={{ fontSize: '0.9rem', color: '#6366F1' }}>See all</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {quests.length === 0 ? (
              <div className="glass-panel text-center" style={{ color: '#94A3B8' }}>No quests active.</div>
            ) : (
              quests.map(quest => (
                <div key={quest.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                      {quest.subject_name} • {quest.difficulty}
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{quest.title}</h4>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem' }}>{quest.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontWeight: 700, color: '#F59E0B' }}>+{quest.base_xp} XP</span>
                    </div>
                    <Link to={`/quest/${quest.id}`} className="btn btn-primary" style={{ padding: '10px 16px' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* League Panel */}
        <div className="glass-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: currentLeagueColor }}></div>
          <Trophy size={48} color={currentLeagueColor} style={{ margin: '0 auto 16px', filter: `drop-shadow(0 0 10px ${currentLeagueColor}66)` }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: currentLeagueColor }}>{stats?.current_league || 'Rookie'} League</h3>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>Global Rank Tracking</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '16px' }}>
            <Activity size={24} color="#10B981" />
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.streak_days}</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Day Streak</div>
          </div>
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '16px' }}>
            <Star size={24} color="#F59E0B" />
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.total_xp}</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Total XP</div>
          </div>
        </div>

        {/* Risen Score Widget */}
        <div className="glass-panel" style={{ background: 'linear-gradient(145deg, rgba(20,25,35,0.8) 0%, rgba(10,13,20,0.8) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <ShieldAlert size={24} color="#6366F1" />
            <h3 style={{ margin: 0 }}>Risen Score</h3>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', textShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>
            {stats?.risen_score || '0.00'}
          </div>
          <p style={{ margin: 0, marginTop: '8px', color: '#94A3B8', fontSize: '0.85rem' }}>
            Your official talent signal verified by effort and skill.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
