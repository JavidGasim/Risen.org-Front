import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  // ─── STEP state ───────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP

  // ─── STEP 1 state ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    universityName: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [showUniDropdown, setShowUniDropdown] = useState(false);

  // ─── STEP 2 state ─────────────────────────────────────────────
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // ─── Shared ───────────────────────────────────────────────────
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, verifyRegister } = useAuth();
  const navigate = useNavigate();

  // ─── University search ────────────────────────────────────────
  useEffect(() => {
    const fetchUnis = async () => {
      if (searchQuery.trim().length < 2) {
        setShowUniDropdown(false);
        setUniversities([]);
        return;
      }
      setLoadingUnis(true);
      try {
        const res = await api.get('/universities/search', {
          params: { q: searchQuery.trim(), limit: 50 }
        });
        const items = res.data?.items || res.data || [];
        setUniversities(items);
        setShowUniDropdown(true);
      } catch (e) {
        console.error('Failed to fetch universities from backend', e);
      } finally {
        setLoadingUnis(false);
      }
    };

    const timer = setTimeout(fetchUnis, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Resend cooldown timer ────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  // ─── Handlers: STEP 1 ─────────────────────────────────────────
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.universityName) {
      setError('Please search and select a university from the list.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.universityName
      );
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        err.message ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: STEP 2 ─────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs[Math.min(pasted.length, 5)].current?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyRegister(formData.email, code);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        err.message ||
        'Invalid or expired code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.universityName
      );
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      otpRefs[0].current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared UI helpers ────────────────────────────────────────
  const ErrorBox = () => error ? (
    <div style={{
      background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444',
      color: '#FCA5A5', padding: '12px', borderRadius: '8px',
      marginBottom: '20px', fontSize: '0.9rem'
    }}>
      {error}
    </div>
  ) : null;

  // ═══════════════════════════════════════════════════════════════
  // STEP 1 — Registration form
  // ═══════════════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <ShieldAlert size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
            <h2>Join the League</h2>
            <p style={{ color: '#94A3B8' }}>Your engineering journey starts here.</p>
          </div>

          <ErrorBox />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text" name="firstName" className="form-control"
                required value={formData.firstName} onChange={handleChange}
                placeholder="e.g. Alice"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text" name="lastName" className="form-control"
                required value={formData.lastName} onChange={handleChange}
                placeholder="e.g. Future"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" name="email" className="form-control"
                required value={formData.email} onChange={handleChange}
                placeholder="engineer@risen.org"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" name="password" className="form-control"
                required value={formData.password} onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            {/* University search */}
            <div className="form-group">
              <label className="form-label">University Search</label>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <input
                  type="text" className="form-control"
                  placeholder="Search by name or country... (e.g. 'az')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                {loadingUnis && (
                  <div style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: '#38BDF8',
                    fontSize: '0.8rem', fontWeight: 600
                  }}>...</div>
                )}
              </div>

              {showUniDropdown && universities.length > 0 && (
                <div style={{
                  background: 'rgba(15,23,42,0.95)', border: '1px solid #334155',
                  borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '8px'
                }}>
                  {universities.map((uni, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px', cursor: 'pointer',
                        borderBottom: '1px solid #1E293B', transition: 'background 0.2s', textAlign: 'left'
                      }}
                      onClick={() => {
                        setFormData({ ...formData, universityName: uni.name });
                        setShowUniDropdown(false);
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,41,59,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: 500, color: '#F8FAFC', fontSize: '0.95rem' }}>{uni.name}</div>
                      {uni.country && <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{uni.country}</div>}
                    </div>
                  ))}
                </div>
              )}
              {showUniDropdown && universities.length === 0 && (
                <div style={{
                  padding: '8px', color: '#94A3B8', fontSize: '0.9rem',
                  textAlign: 'center', background: 'rgba(15,23,42,0.5)',
                  borderRadius: '8px', marginBottom: '8px'
                }}>
                  No universities found. Please try another search.
                </div>
              )}

              {formData.universityName ? (
                <div style={{
                  marginTop: '12px', padding: '12px 16px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#10B981', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Selected University</span>
                    <span style={{ color: '#F8FAFC', fontWeight: 500 }}>{formData.universityName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, universityName: '' })}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#EF4444', cursor: 'pointer', padding: '4px 10px',
                      borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  >Clear</button>
                </div>
              ) : (
                <div style={{
                  marginTop: '12px', padding: '12px 16px',
                  background: 'rgba(30,41,59,0.5)', border: '1px dashed #334155',
                  borderRadius: '8px', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem'
                }}>
                  Please search and select your university from the list.
                </div>
              )}
            </div>

            <button
              type="submit" className="btn btn-success"
              style={{ width: '100%', marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Sending verification code...' : 'Continue →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#94A3B8' }}>
            Already have an account? <Link to="/login" style={{ color: '#10B981', fontWeight: 600 }}>Log In</Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2 — OTP verification
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Mail size={28} color="#10B981" />
          </div>
          <h2>Check Your Email</h2>
          <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>
            We sent a 6-digit verification code to<br />
            <strong style={{ color: '#F8FAFC' }}>{formData.email}</strong>
          </p>
        </div>

        <ErrorBox />

        <form onSubmit={handleVerify}>
          {/* 6-digit OTP boxes */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                autoFocus={i === 0}
                style={{
                  width: '48px', height: '56px',
                  textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                  background: digit ? 'rgba(16,185,129,0.12)' : 'rgba(30,41,59,0.6)',
                  border: digit ? '2px solid rgba(16,185,129,0.5)' : '2px solid #334155',
                  borderRadius: '10px', color: '#F8FAFC',
                  outline: 'none', transition: 'border-color 0.2s, background 0.2s',
                  caretColor: '#10B981'
                }}
                onFocus={e => e.target.style.borderColor = '#10B981'}
                onBlur={e => e.target.style.borderColor = digit ? 'rgba(16,185,129,0.5)' : '#334155'}
              />
            ))}
          </div>

          <button
            type="submit" className="btn btn-success"
            style={{ width: '100%' }}
            disabled={loading || otp.join('').length < 6}
          >
            {loading ? 'Verifying...' : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} /> Verify & Create Account
              </span>
            )}
          </button>
        </form>

        {/* Resend + back */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '8px' }}>
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            style={{
              background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer',
              color: resendCooldown > 0 ? '#64748B' : '#10B981',
              fontWeight: 600, fontSize: '0.9rem', padding: 0,
              transition: 'color 0.2s'
            }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setOtp(['', '', '', '', '', '']); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748B', fontSize: '0.85rem', padding: 0
              }}
            >
              ← Back to registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
