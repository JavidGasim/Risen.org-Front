import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Trophy, Globe, MapPin, AlertTriangle } from 'lucide-react';

const Leaderboards = () => {
  const [globalData, setGlobalData] = useState([]);
  const [localData, setLocalData] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      setError('');
      try {
        const [globalRes, localRes] = await Promise.all([
          api.get('/Leaderboard?limit=25&type=global'),
          api.get('/Leaderboard/local?country=AZ&limit=25') // Defaulting AZ for MVP demo from MVP docs
        ]);
        
        const gData = globalRes.data?.data || globalRes.data?.items || globalRes.data || [];
        const lData = localRes.data?.data || localRes.data?.items || localRes.data || [];
        
        setGlobalData(Array.isArray(gData) ? gData : []);
        setLocalData(Array.isArray(lData) ? lData : []);
      } catch (err) {
        console.error("Leaderboard error", err);
        setError("Unable to sync leaderboard rankings. Data might be outdated or server is down.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const dataToDisplay = activeTab === 'global' ? globalData : localData;

  const getRankColor = (index) => {
    if (index === 0) return '#F59E0B'; // Gold
    if (index === 1) return '#94A3B8'; // Silver
    if (index === 2) return '#D97706'; // Bronze
    return '#E2E8F0'; // Default
  };

  const getRankBackground = (index) => {
    if (index === 0) return 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), transparent)';
    if (index === 1) return 'linear-gradient(90deg, rgba(148, 163, 184, 0.1), transparent)';
    if (index === 2) return 'linear-gradient(90deg, rgba(217, 119, 6, 0.1), transparent)';
    return 'transparent';
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '40px' }} className="slide-up">
        <Trophy size={64} color="#F59E0B" style={{ margin: '0 auto 16px', filter: 'drop-shadow(0 0 15px rgba(245,158,11,0.5))' }} />
        <h1 style={{ fontSize: '3rem', marginBottom: '8px' }}>Global <span className="text-gradient">Rankings</span></h1>
        <p style={{ color: '#94A3B8', fontSize: '1.2rem' }}>See how you rank against the best engineers worldwide.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }} className="slide-up delay-100">
        <button 
          onClick={() => setActiveTab('global')}
          className={`btn ${activeTab === 'global' ? 'btn-primary' : 'btn-outline'}`}
          style={{ width: '180px', padding: '12px', fontSize: '1.05rem', boxShadow: activeTab === 'global' ? '0 0 20px rgba(99,102,241,0.4)' : 'none' }}
        >
          <Globe size={20} /> Global Top
        </button>
        <button 
          onClick={() => setActiveTab('local')}
          className={`btn ${activeTab === 'local' ? 'btn-success' : 'btn-outline'}`}
          style={{ width: '180px', padding: '12px', fontSize: '1.05rem', boxShadow: activeTab === 'local' ? '0 0 20px rgba(16,185,129,0.4)' : 'none' }}
        >
          <MapPin size={20} /> Local (AZ)
        </button>
      </div>

      {error ? (
        <div className="slide-up delay-200" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#FCA5A5', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={32} />
          <div style={{ fontSize: '1.1rem' }}>{error}</div>
        </div>
      ) : loading ? (
        <div className="flex-center slide-up delay-200" style={{ padding: '60px', flexDirection: 'column', gap: '16px' }}>
          <div className="animate-pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366F1' }}></div>
          <div style={{ color: '#94A3B8', fontSize: '1.1rem' }}>Compiling rankings...</div>
        </div>
      ) : (
        <div className="premium-card slide-up delay-200 tab-content" key={activeTab} style={{ padding: 0 }}>
          <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '80px 1fr 150px 120px 150px', gap: '16px', color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <div>Rank</div>
            <div>Engineer</div>
            <div>League</div>
            <div style={{ textAlign: 'right' }}>Total XP</div>
            <div style={{ textAlign: 'right' }}>Risen Score</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dataToDisplay.map((user, index) => (
              <div 
                key={user.id || index} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 1fr 150px 120px 150px', 
                  gap: '16px', 
                  padding: '20px 32px', 
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: getRankBackground(index),
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if(index > 2) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  if(index > 2) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: getRankColor(index) }}>
                  #{index + 1}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', fontWeight: 700, fontSize: '1.1rem' }}>
                    {(user.name || user.firstName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#F8FAFC' }}>{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6366F1' }}>{user.country || 'Global'}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 500, color: '#CBD5E1' }}>
                  {user.current_league || 'Rookie'}
                </div>
                <div style={{ textAlign: 'right', color: '#10B981', fontWeight: 700, fontSize: '1.05rem' }}>
                  {user.total_xp || 0}
                </div>
                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: '#F8FAFC', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
                  {user.risen_score || '0.00'}
                </div>
              </div>
            ))}
            {dataToDisplay.length === 0 && !error && (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Globe size={48} color="rgba(255,255,255,0.1)" />
                  <div>No engineers ranked yet. Be the first to secure a spot!</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboards;
