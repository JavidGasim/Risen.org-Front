import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { setCookie, getCookie, deleteCookie } from '../utils/cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = (token) => {
    if (!token || typeof token !== 'string') return false;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const parsed = JSON.parse(jsonPayload);
      const role = parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || parsed.role;
      return role === 'Admin' || (Array.isArray(role) && role.includes('Admin'));
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getCookie('risen_token');
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
          // Only logout on definitive authentication failures (401/403). 
          // Ignore network errors/502s caused by the backend restarting.
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          } else {
            setIsAuthenticated(true);
            setIsAdmin(checkAdminRole(token));
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/Auth/login', { Email: email, Password: password });

    const returnedToken = data.token || data.accessToken || data.access;
    let adminStatus = false;
    if (returnedToken) {
      adminStatus = checkAdminRole(returnedToken);
      setCookie('risen_token', returnedToken);
      setIsAdmin(adminStatus);
    }

    if (data.user) setUser(data.user);
    setIsAuthenticated(true);

    // Fetch stats right after login
    try {
      const statsRes = await api.get('/Auth/me');
      if (statsRes.data.user) setUser(statsRes.data.user);
      if (statsRes.data.stats) setStats(statsRes.data.stats);
    } catch (e) {
      console.error(e);
    }
    return { ...data, _isAdmin: adminStatus };
  };

  // STEP 1 — OTP göndər (POST /Auth/register)
  const register = async (email, password, firstName, lastName, universityName) => {
    const payload = {
      Email: email,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      UniversityName: universityName
    };
    const { data } = await api.post('/Auth/register', payload);
    // Backend sadəcə OTP göndərir — bu mərhələdə token yoxdur
    return data;
  };

  // STEP 2 — OTP yoxla, hesab yarat (POST /Auth/verify-register)
  const verifyRegister = async (email, code) => {
    const { data } = await api.post('/Auth/verify-register', { Email: email, Code: code });

    const returnedToken = data.token || data.accessToken || data.access;
    if (returnedToken) {
      setCookie('risen_token', returnedToken);
      setIsAdmin(checkAdminRole(returnedToken));
    }

    if (data.user) setUser(data.user);
    setIsAuthenticated(true);

    try {
      const statsRes = await api.get('/Auth/me');
      if (statsRes.data.user) setUser(statsRes.data.user);
      if (statsRes.data.stats) setStats(statsRes.data.stats);
    } catch (e) {
      console.error(e);
    }
    return data;
  };

  const logout = () => {
    deleteCookie('risen_token');
    setUser(null);
    setStats(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post('/Auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (email, token, newPassword) => {
    const { data } = await api.post('/Auth/reset-password', { email, token, newPassword });

    // Automatically log in the user if token is returned
    const returnedToken = data.token || data.accessToken || data.access;
    if (returnedToken) {
      setCookie('risen_token', returnedToken);
      setIsAuthenticated(true);
      setIsAdmin(checkAdminRole(returnedToken));

      try {
        const statsRes = await api.get('/Auth/me');
        setUser(statsRes.data.user);
        setStats(statsRes.data.stats);
      } catch (e) {
        console.error("Failed to fetch user details after reset:", e);
      }
    }

    return data;
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
    <AuthContext.Provider value={{ user, stats, isAuthenticated, isAdmin, login, register, verifyRegister, logout, forgotPassword, resetPassword, refreshStats, loading, checkAdminRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
