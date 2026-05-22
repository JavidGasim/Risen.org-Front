import { Search, Shield, ShieldOff, MoreVertical, Trophy, Star, Activity, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useCallback } from "react";
import { useAdminSignalR } from "../../hooks/useAdminSignalR";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useAdminSignalR({ setUsers, fetchUsers });


  const changeRole = async (id, role) => {
    // optimistic UI (immediate change)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
            ...u,
            role: role
          }
          : u
      )
    );

    try {
      await api.post(`admin/users/${id}/roles`, `"${role}"`);
    } catch (err) {
      console.error(err);
      fetchUsers(); // fallback
    }
  };

  const filteredUsers = (users || []).filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            User Management
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Browse and manage all registered platform users.</p>
        </div>

        <div className="admin-search" style={{ position: 'relative', width: '300px' }}>
          <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: 'white',
              outline: 'none'
            }}
          />
        </div>
      </header>

      <div className="glass-panel admin-table-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading users...</div>
        ) : (
          <div className="admin-table-scroll" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>User</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Email</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>League</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Stats</th>
                  <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            {user.fullName ? user.fullName.charAt(0) : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: '500' }}>{user.fullName || 'Anonymous'}</p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>{user.email}</td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>
                        {user.isAdmin ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={16} color="#3B82F6" />
                            <span style={{ fontWeight: '500', color: '#3B82F6' }}>Admin</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Trophy size={16} color="#A855F7" />
                            <span style={{ fontWeight: '500' }}>{user.stats?.currentLeague || user.stats?.current_league || 'Rookie'}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }} title="Total XP">
                            <Star size={14} /> {user.stats?.totalXp ?? user.stats?.total_xp ?? 0}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }} title="Streak">
                            <Activity size={14} /> {user.stats?.currentStreak ?? user.stats?.current_streak ?? 0}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3B82F6' }} title="Risen Score">
                            <TrendingUp size={14} /> {user.stats?.risenScore ?? user.stats?.risen_score ?? 0}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {user.role !== "Admin" ? (
                            <button
                              onClick={() => changeRole(user.id, "Admin")}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                              title="Make Admin"
                            >
                              <Shield size={14} /> Promote
                            </button>
                          ) : (
                            <button
                              onClick={() => changeRole(user.id, "Student")}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                              title="Remove Admin"
                            >
                              <ShieldOff size={14} /> Demote
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
