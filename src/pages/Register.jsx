import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    universityName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.universityName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ShieldAlert size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
          <h2>Join the League</h2>
          <p style={{ color: '#94A3B8' }}>Your engineering journey starts here.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input 
              type="text" 
              name="firstName"
              className="form-control" 
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Alice"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              className="form-control" 
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Future"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="engineer@risen.org"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-control" 
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">University Name</label>
            <input 
              type="text" 
              name="universityName"
              className="form-control" 
              required
              value={formData.universityName}
              onChange={handleChange}
              placeholder="e.g. Baku State University"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-success" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Start First Quest'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#94A3B8' }}>
          Already have an account? <Link to="/login" style={{ color: '#10B981', fontWeight: 600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
