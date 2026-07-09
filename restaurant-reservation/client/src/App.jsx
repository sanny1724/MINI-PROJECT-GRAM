import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateReservation from './pages/CreateReservation';
import Reservations from './pages/Reservations';
import ManageTables from './pages/ManageTables';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Menu from './pages/Menu';
import ManageMenu from './pages/ManageMenu';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div class="min-h-screen bg-[#0b0c10] text-[#c5c6c7] flex flex-col">
          <Navbar />
          <main class="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/menu" element={<Menu />} />

              {/* General Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book"
                element={
                  <ProtectedRoute>
                    <CreateReservation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute>
                    <Reservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin-Only Protected Routes */}
              <Route
                path="/tables"
                element={
                  <AdminRoute>
                    <ManageTables />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <AdminRoute>
                    <ManageMenu />
                  </AdminRoute>
                }
              />

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          {/* Global Toast Alerts */}
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
