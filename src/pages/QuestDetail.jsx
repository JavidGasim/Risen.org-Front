import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Target, Zap, ChevronLeft, ChevronRight, CheckCircle, 
  AlertTriangle, Disc, Trophy, BookOpen, MessageSquare
} from 'lucide-react';

const QuestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshStats } = useAuth();
  
  const [quest, setQuest] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [allQuests, setAllQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch all metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [todayRes, allRes, subRes] = await Promise.all([
          api.get('/QuestsFeed/today').catch(() => ({ data: { items: [] } })),
          api.get('/QuestsFeed/all').catch(() => ({ data: [] })),
          api.get('/Subjects').catch(() => ({ data: [] }))
        ]);
        
        const todayItems = todayRes.data?.items || [];
        const allItems = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.items || []);
        const subList = subRes.data?.subjects || subRes.data?.items || subRes.data || [];
        
        setAllQuests(allItems);
        setSubjects(subList);

        let foundQuest = todayItems.find(q => q.id === id);
        if (!foundQuest) foundQuest = allItems.find(q => q.id === id);

        if (foundQuest) {
          setQuest(foundQuest);
        } else {
          try {
            const directRes = await api.get(`/QuestsFeed/${id}`);
            setQuest(directRes.data);
          } catch (e) {
            setError("Quest module not found.");
          }
        }
      } catch (err) {
        setError("Failed to initialize module data.");
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, [id]);

  const isCompleted = quest ? (
    quest.isCompletedToday === true || 
    quest.isCompleted === true || 
    quest.isCompletedEver === true ||
    quest.alreadyCompletedEver === true || 
    quest.already_completed_ever === true ||
    quest.isSolved === true ||
    quest.is_completed === true ||
    (quest.completedDateUtc !== undefined && quest.completedDateUtc !== null) ||
    (quest.userSelectedOptionIndex !== undefined && quest.userSelectedOptionIndex !== null) ||
    (quest.userAnswerIndex !== undefined && quest.userAnswerIndex !== null) ||
    (quest.selectedOptionIndex !== undefined && quest.selectedOptionIndex !== null) ||
    !!result
  ) : false;


  useEffect(() => {
    if (quest && isCompleted) {
      // If user had a previous selection, show it
      const prevSelection = quest.userSelectedOptionIndex ?? quest.userAnswerIndex ?? quest.selectedOptionIndex;
      if (prevSelection !== undefined && prevSelection !== null) {
        setSelectedOption(prevSelection);
      }
      
      // If we have completion data, show the result immediately
      const correctIdxValue = quest.correctOptionIndex ?? quest.correctIndex;
      const isCorrectValue = quest.isCorrect ?? quest.is_correct ?? (prevSelection !== undefined && prevSelection === correctIdxValue);
      
      if (isCorrectValue !== undefined || correctIdxValue !== undefined) {
        setResult({
          isCorrect: isCorrectValue,
          correctIndex: correctIdxValue,
          explanation: quest.explanation || quest.analysisReport
        });
      }
    }
  }, [quest, isCompleted]);

  const getSubjectName = (subjectId) => {
    const s = subjects.find(sub => sub.id === subjectId);
    return s ? s.name : 'General Engineering';
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    setSubmitting(true);
    setError('');
    try {
      // POST /api/Quests/submit { questId, selectedIndex }
      const { data } = await api.post(`/Quests/submit`, { 
        questId: id, 
        selectedIndex: selectedOption 
      });
      
      // Normalize response for the UI
      setResult({
        isCorrect: data.isCorrect,
        correctIndex: data.correctIndex,
        xpEarned: data.awardedXp,
        newStats: {
          totalXp: data.totalXp,
          league: data.league,
          streak: data.currentStreak
        }
      });
      
      refreshStats();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || 'Verification failed. Target still active.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentIndex = allQuests.findIndex(q => q.id === id);
  const prevQuest = currentIndex > 0 ? allQuests[currentIndex - 1] : null;
  const nextQuest = currentIndex < allQuests.length - 1 ? allQuests[currentIndex + 1] : null;

  if (loading) return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
      <Disc size={48} color="#10B981" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ color: '#94A3B8', fontSize: '1.1rem', letterSpacing: '1px' }}>SYNCHRONIZING...</div>
    </div>
  );

  if (error || !quest) return (
    <div className="flex-center fade-in" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
      <AlertTriangle size={48} color="#EF4444" />
      <div style={{ fontSize: '1.2rem', color: '#FCA5A5' }}>{error || 'Module offline.'}</div>
      <Link to="/quest" className="btn btn-outline" style={{ marginTop: '16px' }}>Return to Archive</Link>
    </div>
  );

  const isCorrect = result ? result.isCorrect : (quest.isCorrect ?? quest.is_correct);
  const options = quest.options || [];
  const subjectName = getSubjectName(quest.subject_id || quest.subjectId);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="fade-in">
      {/* Header Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/quest" className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', textDecoration: 'none', fontWeight: 600 }}>
          <ChevronLeft size={18} /> Archive
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" disabled={!prevQuest} onClick={() => navigate(`/quest/${prevQuest.id}`)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChevronLeft size={18} /> Prev
          </button>
          <button className="btn btn-outline" disabled={!nextQuest} onClick={() => navigate(`/quest/${nextQuest.id}`)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="slide-up" style={{ marginBottom: '24px', padding: '16px 24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#10B981' }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Mission Accomplished: Read-Only Archive</span>
        </div>
      )}

      <div className="premium-card slide-up" style={{ padding: '48px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <BookOpen size={14} /> {subjectName}
                </div>
                {isCompleted && (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    background: (result ? isCorrect : quest.isCorrect === true) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                    color: (result ? isCorrect : quest.isCorrect === true) ? '#10B981' : '#EF4444', 
                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 
                  }}>
                    {(result ? isCorrect : quest.isCorrect === true) ? <><CheckCircle size={14} /> Correct</> : <><AlertTriangle size={14} /> Incorrect</>}
                  </div>
                )}
              </div>
            <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              {quest.title || quest.questionText}
              {isCompleted && (
                <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, letterSpacing: '1px' }}>COMPLETED</span>
              )}
            </h1>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(245, 158, 11, 0.1)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ color: '#F59E0B', fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>+{quest.xpReward || quest.baseXp || 0}</div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>XP Reward</div>
          </div>
        </div>

        {/* Removed Description as requested, keeping options as primary focus */}
        
        {options.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Select Solution:</h3>
            {options.map((opt, idx) => {
              const optIndex = opt.index !== undefined ? opt.index : idx;
              
              // Determine if this option is selected (either currently or in history)
              const isSelected = selectedOption === optIndex || quest.userSelectedOptionIndex === optIndex || quest.userAnswerIndex === optIndex || quest.selectedOptionIndex === optIndex;
              
              // Determine if this is the correct option
              const isCorrectOption = result ? result.correctIndex === optIndex : (quest.correctOptionIndex === optIndex || quest.correctIndex === optIndex);
              
              const isWrongSelection = (result || isCompleted) && isSelected && !isCorrectOption;
              
              let borderColor = 'rgba(255,255,255,0.08)';
              let bgColor = 'rgba(15, 23, 42, 0.4)';
              let textColor = '#E2E8F0';

              if (isSelected && !result && !isCompleted) {
                borderColor = '#6366F1';
                bgColor = 'rgba(99, 102, 241, 0.15)';
                textColor = '#fff';
              } else if (result || isCompleted) {
                if (isCorrectOption) {
                  borderColor = '#10B981';
                  bgColor = 'rgba(16, 185, 129, 0.15)';
                  textColor = '#6EE7B7';
                } else if (isWrongSelection) {
                  borderColor = '#EF4444';
                  bgColor = 'rgba(239, 68, 68, 0.15)';
                  textColor = '#FCA5A5';
                } else {
                  opacity: 0.5;
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isCompleted || submitting}
                  onClick={() => setSelectedOption(optIndex)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '24px', borderRadius: '18px',
                    border: `2px solid ${borderColor}`, background: bgColor, color: textColor,
                    cursor: isCompleted ? 'default' : 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', alignItems: 'center', gap: '20px', fontSize: '1.1rem', fontWeight: isSelected ? 600 : 400
                  }}
                >
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '10px', 
                    background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 900, flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ flex: 1 }}>{opt.text || opt}</span>
                  {result && isCorrectOption && <CheckCircle size={22} color="#10B981" />}
                  {result && isWrongSelection && <AlertTriangle size={22} color="#EF4444" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <MessageSquare size={48} color="#6366F1" style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p style={{ color: '#94A3B8', margin: 0 }}>This module requires a manual data entry (not multiple choice).</p>
          </div>
        )}

        {result && (
          <div className="fade-in" style={{ marginTop: '40px', padding: '28px', borderRadius: '20px', background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isCorrect ? '#10B981' : '#EF4444'}`, display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            {isCorrect ? <Trophy size={36} color="#F59E0B" /> : <AlertTriangle size={36} color="#EF4444" />}
            <div>
              <h4 style={{ margin: '0 0 6px 0', color: isCorrect ? '#6EE7B7' : '#FCA5A5', fontSize: '1.3rem', fontWeight: 700 }}>{isCorrect ? 'Outstanding Achievement' : 'Target Missed'}</h4>
              <p style={{ margin: 0, color: '#E2E8F0', fontSize: '1.05rem' }}>{isCorrect ? `Analysis confirmed. +${result.xpEarned || quest.xpReward || quest.baseXp || 0} XP secured.` : 'The data provided does not match the expected output.'}</p>
              {result.explanation && (
                 <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', fontSize: '0.95rem', color: '#94A3B8', borderLeft: '4px solid #6366F1', lineHeight: 1.6 }}>
                  <strong>Intelligence Report:</strong> {result.explanation}
                </div>
              )}
            </div>
          </div>
        )}

        {error && <div className="fade-in" style={{ marginTop: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle size={18} /> {error}</div>}

        {!isCompleted && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '48px' }}>
            <button disabled={submitting || selectedOption === null} onClick={handleSubmit} className={`btn ${submitting ? 'btn-outline' : 'btn-success'}`} style={{ padding: '18px 56px', fontSize: '1.2rem', minWidth: '240px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', fontWeight: 700 }}>
              {submitting ? <><Disc size={22} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><Zap size={22} /> Submit Analysis</>}
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
         {nextQuest && isCompleted && (
           <button className="btn btn-primary" onClick={() => navigate(`/quest/${nextQuest.id}`)} style={{ padding: '16px 48px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 700 }}>
             Advance to Next Module <ChevronRight size={22} />
           </button>
         )}
      </div>
    </div>
  );
};

export default QuestDetail;
