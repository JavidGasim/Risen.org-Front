import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { setCookie, getCookie, deleteCookie } from "../utils/cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = (token) => {
    if (!token || typeof token !== "string") return false;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      const parsed = JSON.parse(jsonPayload);
      const role =
        parsed[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || parsed.role;
      return (
        role === "Admin" || (Array.isArray(role) && role.includes("Admin"))
      );
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const hasAdminRole = (value) => {
    if (!value) return false;

    if (typeof value === "string") {
      return value.toLowerCase() === "admin";
    }

    if (Array.isArray(value)) {
      return value.some(hasAdminRole);
    }

    if (typeof value === "object") {
      return Boolean(
        value.isAdmin ||
        value.IsAdmin ||
        hasAdminRole(value.role) ||
        hasAdminRole(value.Role) ||
        hasAdminRole(value.roles) ||
        hasAdminRole(value.Roles) ||
        hasAdminRole(value.userRoles) ||
        hasAdminRole(value.UserRoles),
      );
    }

    return false;
  };

  const resolveAdminStatus = (token, userData) =>
    checkAdminRole(token) || hasAdminRole(userData);

  const refreshCurrentUser = async () => {
    const token = getCookie("risen_token");
    const { data } = await api.get("/Me");
    const { data: rankData } = await api
      .get("/Leaderboards/my-rank")
      .catch(() => ({ data: null }));

    const combinedStats = { ...(data.stats || data) };
    if (rankData) {
      combinedStats.globalRank = rankData.rank || rankData;
      if (rankData.rank) combinedStats.rank = rankData.rank;
    }

    setUser(data);
    setStats(combinedStats);
    setIsAuthenticated(true);
    setIsAdmin(resolveAdminStatus(token, data));

    return data;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getCookie("risen_token");
      if (token) {
        try {
          await refreshCurrentUser();
        } catch (error) {
          console.error("Auth check failed:", error);
          // Only logout on definitive authentication failures (401/403).
          // Ignore network errors/502s caused by the backend restarting.
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
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
    const { data } = await api.post("/Auth/login", {
      Email: email,
      Password: password,
    });

    const returnedToken =
      data.token ||
      data.accessToken ||
      data.access ||
      (typeof data === "string" ? data : null);

    if (
      data &&
      (data.success === false ||
        data.isSuccess === false ||
        data.succeeded === false ||
        data.isSucceeded === false)
    ) {
      throw new Error(data.message || "Invalid credentials");
    }

    if (!returnedToken) {
      throw new Error(data.message || "Invalid email or password");
    }

    const adminStatus = resolveAdminStatus(returnedToken, data.user);
    setCookie("risen_token", returnedToken);
    setIsAdmin(adminStatus);

    if (data.user) setUser(data.user);
    setIsAuthenticated(true);

    console.log("Login response", data);
    console.log("isAuthentificated", isAuthenticated);

    // Fetch stats right after login
    try {
      await refreshCurrentUser();
    } catch (e) {
      console.error(e);
    }
    return { ...data, _isAdmin: adminStatus };
  };

  // Register flow (OTP temporarily disabled)
  const register = async (
    email,
    password,
    firstName,
    lastName,
    universityName,
  ) => {
    const payload = {
      Email: email,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      UniversityName: universityName,
    };
    const { data } = await api.post("/Auth/register", payload);

    const returnedToken = data.token || data.accessToken || data.access;
    let adminStatus = false;
    if (returnedToken) {
      adminStatus = resolveAdminStatus(returnedToken, data.user);
      setCookie("risen_token", returnedToken);
      setIsAdmin(adminStatus);
    }

    if (data.user) setUser(data.user);
    setIsAuthenticated(true);

    try {
      await refreshCurrentUser();
    } catch (e) {
      console.error(e);
    }
    return { ...data, _isAdmin: adminStatus };
  };

  // STEP 2 — OTP yoxla, hesab yarat (POST /Auth/verify-register)
  const verifyRegister = async (email, code) => {
    const { data } = await api.post("/Auth/verify-register", {
      Email: email,
      Code: code,
    });

    const returnedToken = data.token || data.accessToken || data.access;
    if (returnedToken) {
      setCookie("risen_token", returnedToken);
      setIsAdmin(resolveAdminStatus(returnedToken, data.user));
    }

    if (data.user) setUser(data.user);
    setIsAuthenticated(true);

    try {
      await refreshCurrentUser();
    } catch (e) {
      console.error(e);
    }
    return data;
  };

  const logout = () => {
    deleteCookie("risen_token");
    setUser(null);
    setStats(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/Auth/forgot-password", { email });
    return data;
  };

  const resetPassword = async (email, token, newPassword) => {
    const { data } = await api.post("/Auth/reset-password", {
      email,
      token,
      newPassword,
    });

    // Automatically log in the user if token is returned
    const returnedToken = data.token || data.accessToken || data.access;
    if (returnedToken) {
      setCookie("risen_token", returnedToken);
      setIsAuthenticated(true);
      setIsAdmin(resolveAdminStatus(returnedToken, data.user));

      try {
        await refreshCurrentUser();
      } catch (e) {
        console.error("Failed to fetch user details after reset:", e);
      }
    }

    return data;
  };

  const refreshStats = async () => {
    try {
      await refreshCurrentUser();
    } catch (error) {
      console.error("Failed to refresh stats", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        isAuthenticated,
        isAdmin,
        login,
        register,
        verifyRegister,
        logout,
        forgotPassword,
        resetPassword,
        refreshStats,
        loading,
        checkAdminRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
