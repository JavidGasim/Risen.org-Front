import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const parsed = JSON.parse(jsonPayload);
      const role = parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || parsed.role;
      return role === 'Admin' || (Array.isArray(role) && role.includes('Admin'));
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('risen_token');
      if (token) {
        try {
          // Verify token and get user/stats
          const { data } = await api.get('/Auth/me');
          setUser(data.user);
          setStats(data.stats);
          setIsAuthenticated(true);
          setIsAdmin(checkAdminRole(token));
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/Auth/login', { Email: email, Password: password });
    localStorage.setItem('risen_token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    setIsAdmin(checkAdminRole(data.token));
    
    // Fetch stats right after login
    try {
      const statsRes = await api.get('/Auth/me');
      setStats(statsRes.data.stats);
    } catch (e) {
      console.error(e);
    }
    return data;
  };

  const register = async (email, password, firstName, lastName, universityName) => {
    const payload = {
      Email: email,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      UniversityName: universityName
    };
    const { data } = await api.post('/Auth/register', payload);
    localStorage.setItem('risen_token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    setIsAdmin(checkAdminRole(data.token));
    
    try {
      const statsRes = await api.get('/Auth/me');
      setStats(statsRes.data.stats);
    } catch (e) {
      console.error(e);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('risen_token');
    setUser(null);
    setStats(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const refreshStats = async () => {
    try {
      const { data } = await api.get('/Auth/me');
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to refresh stats", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, stats, isAuthenticated, isAdmin, login, register, logout, refreshStats, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
