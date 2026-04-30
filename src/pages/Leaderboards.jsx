import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Globe, GraduationCap, AlertTriangle, Disc, Target, Zap } from 'lucide-react';

const Leaderboards = () => {
  const { user } = useAuth();
  const [globalData, setGlobalData] = useState([]);
  const [uniData, setUniData] = useState([]);
  const [leagueData, setLeagueData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      setError('');
      try {
        const [globalRes, uniRes, leagueRes, rankRes] = await Promise.all([
          api.get('/Leaderboards/global', { params: { limit: 50 } }),
          api.get('/Leaderboards/my-university', { params: { limit: 50 } }).catch(() => ({ data: { items: [] } })),
          api.get('/Leaderboards/my-league', { params: { limit: 50 } }).catch(() => ({ data: { items: [] } })),
          api.get('/Leaderboards/my-rank').catch(() => ({ data: null }))
        ]);
        
        // Map items from the wrapper object { items, total, ... }
        const gItems = globalRes.data?.items || [];
        const uItems = uniRes.data?.items || [];
        const lItems = leagueRes.data?.items || [];
        
        setGlobalData(gItems);
        setUniData(uItems);
        setLeagueData(lItems);
        setMyRank(rankRes.data);
      } catch (err) {
        console.error("Leaderboard error", err);
        setError("Neural synchronization failed. Rankings are temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const dataToDisplay = activeTab === 'global' ? globalData : (activeTab === 'university' ? uniData : leagueData);

  const getRankColor = (rank) => {
    if (rank === 1) return '#F59E0B'; // Gold
    if (rank === 2) return '#94A3B8'; // Silver
    if (rank === 3) return '#D97706'; // Bronze
    return '#E2E8F0'; 
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return 'linear-gradient(90deg, rgba(245, 158, 11, 0.1), transparent)';
    if (rank === 2) return 'linear-gradient(90deg, rgba(148, 163, 184, 0.08), transparent)';
    if (rank === 3) return 'linear-gradient(90deg, rgba(217, 119, 6, 0.08), transparent)';
    return 'transparent';
  };

  if (loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
      <Disc size={48} color="#6366F1" className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
      <div style={{ color: '#94A3B8', fontSize: '1.1rem', letterSpacing: '1px' }}>CALCULATING HIERARCHY...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '48px' }} className="slide-up">
        <Trophy size={64} color="#F59E0B" style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 15px rgba(245,158,11,0.5))' }} />
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '8px' }}>Risen <span className="text-gradient">Leaderboards</span></h1>
        <p style={{ color: '#94A3B8', fontSize: '1.2rem' }}>Global and institutional rankings for top-tier engineers.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }} className="slide-up">
        <button 
          onClick={() => setActiveTab('global')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 32px', 
            borderRadius: '16px', border: activeTab === 'global' ? '1px solid #6366F1' : '1px solid rgba(255,255,255,0.05)',
            background: activeTab === 'global' ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.4)',
            color: activeTab === 'global' ? '#fff' : '#94A3B8', cursor: 'pointer', transition: 'all 0.2s',
            fontWeight: 700, fontSize: '1rem', boxShadow: activeTab === 'global' ? '0 0 30px rgba(99,102,241,0.2)' : 'none'
          }}
        >
          <Globe size={20} color={activeTab === 'global' ? '#6366F1' : '#94A3B8'} /> Global
        </button>
        <button 
          onClick={() => setActiveTab('university')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 32px', 
            borderRadius: '16px', border: activeTab === 'university' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.05)',
            background: activeTab === 'university' ? 'rgba(16,185,129,0.1)' : 'rgba(15,23,42,0.4)',
            color: activeTab === 'university' ? '#fff' : '#94A3B8', cursor: 'pointer', transition: 'all 0.2s',
            fontWeight: 700, fontSize: '1rem', boxShadow: activeTab === 'university' ? '0 0 30px rgba(16,185,129,0.2)' : 'none'
          }}
        >
          <GraduationCap size={20} color={activeTab === 'university' ? '#10B981' : '#94A3B8'} /> {user?.universityName || user?.university?.name || 'University'}
        </button>
        <button 
          onClick={() => setActiveTab('league')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 32px', 
            borderRadius: '16px', border: activeTab === 'league' ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.05)',
            background: activeTab === 'league' ? 'rgba(245,158,11,0.1)' : 'rgba(15,23,42,0.4)',
            color: activeTab === 'league' ? '#fff' : '#94A3B8', cursor: 'pointer', transition: 'all 0.2s',
            fontWeight: 700, fontSize: '1rem', boxShadow: activeTab === 'league' ? '0 0 30px rgba(245,158,11,0.2)' : 'none'
          }}
        >
          <Zap size={20} color={activeTab === 'league' ? '#F59E0B' : '#94A3B8'} /> {user?.league || 'League'}
        </button>
      </div>

      {error ? (
        <div style={{ padding: '40px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#FCA5A5', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <AlertTriangle size={48} />
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{error}</div>
        </div>
      ) : (
        <div className="premium-card slide-up" key={activeTab} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '80px 1fr 200px 140px', gap: '20px', color: '#64748B', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            <div>Rank</div>
            <div>Engineer</div>
            <div>League</div>
            <div style={{ textAlign: 'right' }}>Total XP</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dataToDisplay.map((u) => (
              <div 
                key={u.userId} 
                style={{ 
                  display: 'grid', gridTemplateColumns: '80px 1fr 200px 140px', gap: '20px', 
                  padding: '24px 32px', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: getRankBackground(u.rank),
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = getRankBackground(u.rank); }}
              >
                <div style={{ fontWeight: 900, fontSize: '1.4rem', color: getRankColor(u.rank), fontStyle: 'italic' }}>
                  #{u.rank}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', fontWeight: 800, fontSize: '1.2rem' }}>
                    {(u.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F8FAFC' }}>{u.displayName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <Target size={12} /> {u.universityName || 'Risen Engineer'}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {u.league || 'Rookie'}
                </div>
                <div style={{ textAlign: 'right', color: '#10B981', fontWeight: 800, fontSize: '1.2rem' }}>
                  {u.totalXp.toLocaleString()}
                </div>
              </div>
            ))}
            
            {dataToDisplay.length === 0 && (
              <div style={{ padding: '80px 40px', textAlign: 'center', color: '#64748B' }}>
                <Globe size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <div style={{ fontSize: '1.1rem' }}>No rankings available in this sector.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboards;
