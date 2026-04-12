import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Zap, Compass, Trophy, User } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      padding: '20px 40px',
      background: 'rgba(5, 7, 10, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={28} color="#10B981" />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px', color: '#fff' }}>
            RISEN<span style={{ color: '#10B981' }}>.ORG</span>
          </span>
        </Link>
        
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.95rem' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0' }}>
              <Compass size={18} /> Dashboard
            </Link>
            <Link to="/subjects" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0' }}>
              <Zap size={18} /> Subjects
            </Link>
            <Link to="/leaderboards" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0' }}>
              <Trophy size={18} /> Leaderboards
            </Link>
          </div>
        )}
      </div>

      <div>
        {!isAuthenticated ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Join the League</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
              <User size={18} />
              <span>{user?.name || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
