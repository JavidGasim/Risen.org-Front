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
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="quests" element={<div style={{color:'white', padding: '40px'}}>Quests Management Coming Soon</div>} />
            <Route path="settings" element={<div style={{color:'white', padding: '40px'}}>Settings Coming Soon</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
