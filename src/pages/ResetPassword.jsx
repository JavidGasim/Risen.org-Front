import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize from URL if present
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !token) {
      setError('Please provide the reset token and email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, token, password);
      setMessage('Password successfully reset! Logging you in...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.message || data?.detail || data?.title || err.message || 'Failed to reset password';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ShieldAlert size={48} color="#6366F1" style={{ margin: '0 auto 16px' }} />
          <h2>Reset Password</h2>
          <p style={{ color: '#94A3B8' }}>Enter your new password below.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(2ef, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', color: '#6EE7B7', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!searchParams.get('email') && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@risen.org"
              />
            </div>
          )}

          {!searchParams.get('token') && (
            <div className="form-group">
              <label className="form-label">Reset Token</label>
              <input 
                type="text" 
                className="form-control" 
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token here"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-control" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              className="form-control" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading || !email || !token}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#94A3B8' }}>
          Remember your password? <Link to="/login" style={{ color: '#6366F1', fontWeight: 600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
