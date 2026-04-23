import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Quest from './pages/Quest';
import Leaderboards from './pages/Leaderboards';
import Pricing from './pages/Pricing';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUniversities from './pages/admin/AdminUniversities';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminQuests from './pages/admin/AdminQuests';
import AdminPlans from './pages/admin/AdminPlans';
import AdminLeagues from './pages/admin/AdminLeagues';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={!isAdminRoute ? "container" : ""} style={!isAdminRoute ? { padding: '40px 24px', flex: 1 } : { }}>
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
          <Route path="/quest/:id" element={isAuthenticated ? <Quest /> : <Navigate to="/login" />} />
          <Route path="/leaderboards" element={isAuthenticated ? <Leaderboards /> : <Navigate to="/login" />} />
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
            <Route path="settings" element={<div style={{color:'white', padding: '40px'}}>Settings Coming Soon</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
