import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getAttemptIsCorrect, getAttemptQuestId, toArray } from '../utils/questAttempts';
import { getUserDisplayName, getUserId } from '../utils/friendship';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Star,
  Trophy,
  ShieldCheck,
  Users,
  MapPin,
  Loader2,
  Globe,
  Settings as SettingsIcon
} from 'lucide-react';

const profileEndpoints = [
  (id) => api.get(`/Users/${id}`),
  (id) => api.get(`/user/${id}`),
  (id) => api.get(`/User/${id}`),
  (id) => api.get(`/Profile/${id}`),
  (id) => api.get(`/Users/profile/${id}`)
];

const formatDate = (value) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getAttemptCreatedDate = (attempt) => {
  return new Date(
    attempt.createdAt || attempt.created_at || attempt.createdDate || attempt.created_date || attempt.date || attempt.Date || attempt.submittedAt || attempt.submitted_at || Date.now()
  );
};

const getAttemptUserId = (attempt) => {
  return attempt.userId || attempt.UserId || attempt.user_id || attempt.User_Id || attempt.User_Id || null;
};

const getUserProfileResult = async (userId) => {
  if (!userId) throw new Error('Missing user id');

  for (const endpoint of profileEndpoints) {
    try {
      const response = await endpoint(userId);
      if (response?.data) return response.data;
    } catch (error) {
      if (error?.response?.status === 404) continue;
      throw error;
    }
  }

  const searchResponse = await api.get('/Friend/search', { params: { searchTerm: userId } });
  const candidates = Array.isArray(searchResponse.data)
    ? searchResponse.data
    : searchResponse.data?.items || searchResponse.data?.result || searchResponse.data?.friends || searchResponse.data?.requests || [];

  return candidates.find((item) => String(getUserId(item)) === String(userId)) || null;
};

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = !userId || String(getUserId(currentUser)) === String(userId);
  const profileKey = isOwnProfile ? getUserId(currentUser) : userId;
  const displayName = getUserDisplayName(profile || currentUser || {});

  const activityDays = useMemo(() => {
    const today = new Date();
    const days = [];
    const statsMap = {};

    for (let i = 34; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const key = day.toISOString().split('T')[0];
      days.push({ key, date: day });
      statsMap[key] = { date: day, total: 0, success: 0, fail: 0 };
    }

    attempts.forEach((attempt) => {
      const date = getAttemptCreatedDate(attempt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().split('T')[0];
      if (!statsMap[key]) return;
      const isSuccess = getAttemptIsCorrect(attempt);
      statsMap[key].total += 1;
      if (isSuccess) statsMap[key].success += 1;
      else statsMap[key].fail += 1;
    });

    return days.map((day) => {
      const dayStats = statsMap[day.key];
      const color = dayStats.total === 0
        ? '#0F172A'
        : dayStats.success === dayStats.total
          ? '#10B981'
          : dayStats.success > 0
            ? '#F59E0B'
            : '#EF4444';
      return { ...day, ...dayStats, color };
    });
  }, [attempts]);

  const summary = useMemo(() => {
    const total = attempts.length;
    const success = attempts.filter(getAttemptIsCorrect).length;
    const successRate = total ? Math.round((success / total) * 100) : 0;
    const lastAttempt = attempts.slice().sort((a, b) => getAttemptCreatedDate(b) - getAttemptCreatedDate(a))[0];
    const lastActive = lastAttempt ? formatDate(getAttemptCreatedDate(lastAttempt)) : 'No activity yet';

    return { total, success, successRate, lastActive };
  }, [attempts]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileKey) {
        setError('Unable to determine profile.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        let fetchedProfile = null;

        if (isOwnProfile) {
          fetchedProfile = currentUser;
        } else {
          fetchedProfile = await getUserProfileResult(profileKey);
        }

        if (!fetchedProfile) {
          setError('Could not load this profile.');
          setLoading(false);
          return;
        }

        setProfile(fetchedProfile);

        const attemptResponse = await api.get('/Quest-Attempts', {
          params: {
            limit: 500,
            userId: profileKey
          }
        });

        const allAttempts = toArray(attemptResponse.data || []);
        const filtered = allAttempts.filter((attempt) => {
          const attemptUserId = getAttemptUserId(attempt);
          return !attemptUserId || String(attemptUserId) === String(profileKey);
        });

        setAttempts(filtered);
      } catch (err) {
        console.error('UserProfile load failed', err);
        setError(err.response?.data?.message || 'Something went wrong while loading profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, isOwnProfile, profileKey]);

  if (loading) {
    return (
      <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '18px' }}>
        <Loader2 size={42} className="animate-spin" color="#6366F1" />
        <div style={{ color: '#94A3B8' }}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '18px' }}>
        <XCircle size={48} color="#EF4444" />
        <div style={{ color: '#FCA5A5', fontWeight: 700 }}>{error}</div>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back
        </button>

        {isOwnProfile && (
          <button className="btn btn-primary" onClick={() => navigate('/profile')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={16} /> Settings
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px', marginBottom: '32px' }}>
        <div className="premium-card slide-up" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '62px', height: '62px', borderRadius: '18px', background: 'linear-gradient(135deg,#6366F1,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: '#fff', fontWeight: 800 }}>
                  {displayName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>{displayName}</div>
                  <div style={{ color: '#94A3B8', marginTop: '6px' }}>{profile.universityName || profile.university?.name || 'Independent Learner'}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>{isOwnProfile ? 'Your profile' : 'Public profile'}</div>
              <div style={{ padding: '10px 16px', borderRadius: '999px', background: 'rgba(16,185,129,0.08)', color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>{profile.plan || profile.entitlement?.plan || 'Free Member'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ShieldCheck size={18} color="#6366F1" />
                <span style={{ fontWeight: 700 }}>Joined</span>
              </div>
              <div style={{ color: '#94A3B8' }}>{profile.createdAt ? formatDate(profile.createdAt) : profile.createdDate ? formatDate(profile.createdDate) : 'Unknown'}</div>
            </div>
            <div style={{ padding: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <MapPin size={18} color="#10B981" />
                <span style={{ fontWeight: 700 }}>Location</span>
              </div>
              <div style={{ color: '#94A3B8' }}>{profile.location || profile.city || profile.country || 'Unknown'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#94A3B8', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700 }}>Quests Solved</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC' }}>{summary.success}</div>
            </div>
            <div style={{ padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#94A3B8', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700 }}>Total Attempts</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC' }}>{summary.total}</div>
            </div>
            <div style={{ padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#94A3B8', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700 }}>Success Rate</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC' }}>{summary.successRate}%</div>
            </div>
          </div>

          <div style={{ padding: '22px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontWeight: 700, color: '#F8FAFC' }}>
              <CalendarDays size={18} /> Activity Calendar
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
              {activityDays.map((day) => (
                <div
                  key={day.key}
                  title={`${day.key} — ${day.total} attempt${day.total === 1 ? '' : 's'}`}
                  style={{
                    width: '100%',
                    minHeight: '20px',
                    borderRadius: '6px',
                    background: day.color,
                    border: day.total === 0 ? '1px solid rgba(148,164,184,0.18)' : '1px solid transparent'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px', color: '#94A3B8', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '14px', background: '#0F172A', border: '1px solid rgba(148,164,184,0.18)', borderRadius: '4px' }} /> No activity</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '14px', background: '#EF4444', borderRadius: '4px' }} /> Failed</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '14px', background: '#F59E0B', borderRadius: '4px' }} /> Mixed</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '14px', height: '14px', background: '#10B981', borderRadius: '4px' }} /> All success</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div className="premium-card slide-up" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <Users size={20} color="#10B981" />
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>About {displayName}</h2>
            </div>
            <div style={{ color: '#94A3B8', lineHeight: 1.7, marginBottom: '18px' }}>
              {profile.bio || profile.about || 'No profile bio has been added yet.'}
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Star size={16} color="#F59E0B" /><span style={{ color: '#F8FAFC', fontWeight: 700 }}>Current streak:</span> <span style={{ color: '#94A3B8' }}>{profile.stats?.currentStreak ?? profile.stats?.current_streak ?? 'N/A'}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Trophy size={16} color="#6366F1" /><span style={{ color: '#F8FAFC', fontWeight: 700 }}>Global rank:</span> <span style={{ color: '#94A3B8' }}>{profile.stats?.globalRank ?? profile.stats?.global_rank ?? 'N/A'}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Globe size={16} color="#10B981" /><span style={{ color: '#F8FAFC', fontWeight: 700 }}>Total XP:</span> <span style={{ color: '#94A3B8' }}>{profile.stats?.totalXp ?? profile.stats?.total_xp ?? profile.totalXp ?? profile.total_xp ?? 'N/A'}</span></div>
            </div>
          </div>

          <div className="premium-card slide-up" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <Activity size={20} color="#6366F1" />
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Latest activity</h2>
            </div>
            {attempts.length === 0 ? (
              <div style={{ color: '#94A3B8' }}>No quest activity available yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {attempts.slice(0, 5).map((attempt) => {
                  const createdDate = getAttemptCreatedDate(attempt);
                  const isCorrect = getAttemptIsCorrect(attempt);
                  return (
                    <div key={attempt.id || `${attempt.questId}-${attempt.createdAt}-${attempt.created_at}`} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ color: '#F8FAFC', fontWeight: 700 }}>{attempt.questTitle || attempt.title || `Quest ${getAttemptQuestId(attempt) || 'Unknown'}`}</div>
                        <span style={{ color: isCorrect ? '#10B981' : '#EF4444', fontWeight: 700, fontSize: '0.85rem' }}>{isCorrect ? 'Solved' : 'Failed'}</span>
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>{formatDate(createdDate)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
