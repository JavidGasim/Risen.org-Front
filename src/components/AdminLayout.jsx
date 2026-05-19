import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Library, BookOpen, Map, Settings, LogOut, CreditCard, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Universities', href: '/admin/universities', icon: Library },
    { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { name: 'Quests', href: '/admin/quests', icon: Map },
    { name: 'League Tiers', href: '/admin/leagues', icon: Trophy },
    { name: 'Plans', href: '/admin/plans', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: '280px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            Risen Admin
          </h1>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' }}>
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                  background: isActive ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))' : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  fontWeight: isActive ? '600' : '500'
                }}
              >
                <item.icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 24px', marginTop: 'auto' }}>
          <button
            onClick={logout}
            style={{ 
              width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Top Header */}
        <header className="admin-topbar" style={{ 
          padding: '16px 40px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <button
            onClick={logout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'transparent', color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.5)', padding: '8px 16px', borderRadius: '8px',
              cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </header>

        <div className="admin-content" style={{ padding: '40px', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
