import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      
      // If backend returned a raw token (for development testing), display a handy link.
      const returnedToken = typeof response === 'string' ? response : (response?.token || response?.Token);
      
      if (returnedToken) {
        const resetUrl = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(returnedToken)}`;
        setMessage(
          <div>
            <p>Development Only - Token generated!</p>
            <a href={resetUrl} style={{ color: '#10B981', textDecoration: 'underline', wordBreak: 'break-all' }}>
              Click here to test your Reset Password link
            </a>
          </div>
        );
      } else {
        setMessage('If an account exists with that email, a password reset link has been sent.');
      }
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.message || data?.detail || data?.title || err.message || 'Failed to process request';
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
          <h2>Forgot Password</h2>
          <p style={{ color: '#94A3B8' }}>Enter your email to reset your password.</p>
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#94A3B8' }}>
          Remember your password? <Link to="/login" style={{ color: '#6366F1', fontWeight: 600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
