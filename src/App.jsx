import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Quest from './pages/Quest';
import CompletedQuests from './pages/CompletedQuests';
import QuestDetail from './pages/QuestDetail';
import Leaderboards from './pages/Leaderboards';
import Pricing from './pages/Pricing';
import Posts from './pages/Posts';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUniversities from './pages/admin/AdminUniversities';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminQuests from './pages/admin/AdminQuests';
import AdminPlans from './pages/admin/AdminPlans';
import AdminLeagues from './pages/admin/AdminLeagues';
import AdminSettings from './pages/admin/AdminSettings';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAuthenticated && isAdmin && !isAdminRoute) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, isAdminRoute, navigate]);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={!isAdminRoute ? "container app-main" : ""} style={!isAdminRoute ? { padding: '40px 24px', flex: 1 } : { }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/subjects" element={isAuthenticated ? <Subjects /> : <Navigate to="/login" />} />
          <Route path="/posts" element={isAuthenticated ? <Posts /> : <Navigate to="/login" />} />
          <Route path="/friends" element={isAuthenticated ? <Friends /> : <Navigate to="/login" />} />
          <Route path="/quest" element={isAuthenticated ? <Quest /> : <Navigate to="/login" />} />
          <Route path="/quest/completed" element={isAuthenticated ? <CompletedQuests /> : <Navigate to="/login" />} />
          <Route path="/quest/:id" element={isAuthenticated ? <QuestDetail /> : <Navigate to="/login" />} />
          <Route path="/leaderboards" element={isAuthenticated ? <Leaderboards /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="universities" element={<AdminUniversities />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="quests" element={<AdminQuests />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="leagues" element={<AdminLeagues />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
