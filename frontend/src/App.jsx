// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import PublicDashboard from './pages/PublicDashboard';

// Import Components
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for cached user credentials on startup
    const cachedToken = localStorage.getItem('stockflow_token');
    const cachedUser = localStorage.getItem('stockflow_user');
    
    if (cachedToken && cachedUser) {
      setToken(cachedToken);
      setUser(JSON.parse(cachedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    setUser(null);
    setToken(null);
  };

  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#08090c]">
        <div className="animate-pulse text-slate-400 font-semibold tracking-wider text-sm">
          Loading StockFlow...
        </div>
      </div>
    );
  }

  // Component to protect router paths
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return <Layout user={user} onLogout={handleLogout}>{children}</Layout>;
  };

  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          {/* Public Landing & Dashboard Paths */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/public/village/:villageCode" element={<PublicDashboard />} />

          {/* Public Auth Path */}
          <Route 
            path="/login" 
            element={
              token ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            } 
          />

          {/* Protected App Paths */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings onUserUpdate={handleUserUpdate} />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Redirects */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>

        {/* Global Toast Provider */}
        <ToastContainer 
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </BrowserRouter>
  );
}
