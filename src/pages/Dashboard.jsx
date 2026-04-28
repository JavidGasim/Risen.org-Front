import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Star, Trophy, ShieldAlert, ArrowRight, Target, Zap, Layout } from 'lucide-react';

const Dashboard = () => {
  const { user, stats, refreshStats } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await refreshStats();
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '80vh' }}>
      <div className="animate-pulse-glow" style={{ width: '40px', height: '40px', background: 'var(--accent-indigo)', borderRadius: '50%' }}></div>
    </div>
  );

  const currentLeagueColor = stats?.current_league === 'Rookie' ? '#9CA3AF' :
    stats?.current_league === 'Challenger' ? '#6366F1' :
      stats?.current_league === 'Pro' ? '#10B981' :
        stats?.current_league === 'Elite' ? '#8B5CF6' : '#F59E0B'; // Legend

  return (
    <div className="container fade-in" style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', marginTop: '20px' }}>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* 1. Welcome Message & Focus */}
          <div className="slide-up">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '2.8rem', margin: 0 }}>
                Welcome back, <span className="text-gradient">{user?.firstName || 'Engineer'}</span>
              </h2>
              <Zap size={32} color="#F59E0B" style={{ marginBottom: '8px' }} />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} color="#6366F1" /> Daily Focus: Reach a new performance peak today.
            </p>
          </div>

          {/* 2. Performance Overview (Replacing Quests) */}
          <section className="slide-up delay-100">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#CBD5E1' }}>Performance Overview</h3>
              <Link to="/subjects" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                View All Subjects <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { name: 'Mathematics', progress: 75, color: '#6366F1' },
                { name: 'Physics', progress: 40, color: '#F59E0B' },
                { name: 'Computer Science', progress: 90, color: '#10B981' },
                { name: 'Logic', progress: 65, color: '#8B5CF6' }
              ].map((subject, idx) => (
                <div key={subject.name} className="premium-card slide-up" style={{ padding: '24px', animationDelay: `${(idx + 1) * 100}ms` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#F8FAFC' }}>{subject.name}</h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: subject.color }}>{subject.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${subject.progress}%`, height: '100%', background: subject.color, borderRadius: '10px', boxShadow: `0 0 10px ${subject.color}66` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Quick Navigation */}
          <section className="slide-up delay-200">
             <h3 style={{ margin: '0 0 24px 0', fontSize: '1.6rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#CBD5E1' }}>Quick Access</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <Link to="/quest" className="premium-card" style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Layout size={32} color="#6366F1" />
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Quest Archive</span>
                </Link>
                <Link to="/leaderboards" className="premium-card" style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Trophy size={32} color="#F59E0B" />
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Leaderboards</span>
                </Link>
                <Link to="/pricing" className="premium-card" style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Star size={32} color="#10B981" />
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Upgrade Pro</span>
                </Link>
             </div>
          </section>
        </div>

        {/* Sidebar: Status Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="slide-up delay-300">

          {/* League Panel */}
          <div className="premium-card glow-border" style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(15, 23, 42, 0.9)', position: 'relative', overflow: 'visible' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: currentLeagueColor, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}></div>
            <Trophy size={64} color={currentLeagueColor} style={{ margin: '0 auto 16px', filter: `drop-shadow(0 0 20px ${currentLeagueColor}88)` }} />
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.8rem', color: currentLeagueColor, textShadow: `0 0 15px ${currentLeagueColor}44` }}>
              {stats?.currentLeague ?? stats?.current_league ?? 'Rookie'}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#94A3B8', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 600 }}>League Standing</p>
            
            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'baseline' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Global Rank:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                #{stats?.rank || stats?.globalRank || stats?.global_rank || '—'}
              </span>
            </div>
          </div>

          {/* Core Metrics (Streak & XP) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="premium-card" style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Activity size={32} color="#10B981" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
                {stats?.streakDays ?? stats?.streak_days ?? stats?.streakDaysCount ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Day Streak</div>
            </div>
            <div className="premium-card" style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Star size={32} color="#F59E0B" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
                {stats?.totalXp ?? stats?.total_xp ?? stats?.totalXP ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total XP</div>
            </div>
          </div>

          {/* Risen Score Widget */}
          <div className="premium-card" style={{ 
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.1) 0%, rgba(10, 13, 20, 0.95) 100%)', 
            border: '1px solid rgba(99, 102, 241, 0.3)', 
            padding: '28px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldAlert size={28} color="#6366F1" />
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Risen Score</h3>
            </div>
            <div style={{ fontSize: '3.8rem', fontWeight: 900, color: '#fff', textShadow: '0 0 30px rgba(99, 102, 241, 0.6)', lineHeight: 1 }}>
              {stats?.risenScore ?? stats?.risen_score ?? '0.00'}
            </div>
            <p style={{ margin: '16px 0 0 0', color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Your official talent signal verified by effort and skill.
            </p>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-10px', opacity: 0.05 }}>
              <Zap size={120} color="#fff" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
