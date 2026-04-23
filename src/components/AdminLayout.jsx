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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0'
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
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={18} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
