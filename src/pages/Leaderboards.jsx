import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Trophy, Globe, MapPin } from 'lucide-react';

const Leaderboards = () => {
  const [globalData, setGlobalData] = useState([]);
  const [localData, setLocalData] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        const [globalRes, localRes] = await Promise.all([
          api.get('/Leaderboard?limit=25&type=global'),
          api.get('/Leaderboard/local?country=AZ&limit=25') // Defaulting AZ for MVP demo from MVP docs
        ]);
        setGlobalData(globalRes.data.data);
        setLocalData(localRes.data.data);
      } catch (err) {
        console.error("Leaderboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const dataToDisplay = activeTab === 'global' ? globalData : localData;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Trophy size={48} color="#F59E0B" style={{ margin: '0 auto 16px' }} />
        <h1>Leaderboards</h1>
        <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>See how you rank against the best engineers.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('global')}
          className={`btn ${activeTab === 'global' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Globe size={18} /> Global Ranking
        </button>
        <button 
          onClick={() => setActiveTab('local')}
          className={`btn ${activeTab === 'local' ? 'btn-primary' : 'btn-outline'}`}
        >
          <MapPin size={18} /> Local (AZ)
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading ranks...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--panel-border)' }}>
                <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 500 }}>Rank</th>
                <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 500 }}>Engineer</th>
                <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 500 }}>League</th>
                <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 500, textAlign: 'right' }}>Total XP</th>
                <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 500, textAlign: 'right' }}>Risen Score</th>
              </tr>
            </thead>
            <tbody>
              {dataToDisplay.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: index < 3 ? '#F59E0B' : '#E2E8F0' }}>
                    #{index + 1}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                    {user.name} <span style={{ fontSize: '0.8rem', color: '#6366F1', marginLeft: '8px' }}>{user.country}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {user.current_league}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', color: '#10B981', fontWeight: 600 }}>
                    {user.total_xp}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700 }}>
                    {user.risen_score}
                  </td>
                </tr>
              ))}
              {dataToDisplay.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Leaderboards;
