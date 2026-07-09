import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Utensils, Menu, X, LogOut, User as UserIcon, Calendar, LayoutDashboard, Grid } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => {
    return `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive(path)
        ? 'text-brand-400 bg-brand-950/30 border border-brand-900/30'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
    }`;
  };

  return (
    <nav class="sticky top-0 z-50 w-full glass-panel border-b border-zinc-800/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" class="flex items-center gap-2 text-zinc-100 font-semibold text-lg tracking-tight">
            <div class="p-1.5 rounded-lg bg-brand-600/10 border border-brand-500/30">
              <Utensils class="h-5 w-5 text-brand-500" />
            </div>
            <span class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-brand-400">
              GourmetTable
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div class="hidden md:flex items-center gap-6">
              {user.role === 'admin' ? (
                <>
                  <Link to="/dashboard" class={linkClass('/dashboard')}>
                    <LayoutDashboard class="h-4 w-4" />
                    Admin Panel
                  </Link>
                  <Link to="/tables" class={linkClass('/tables')}>
                    <Grid class="h-4 w-4" />
                    Manage Tables
                  </Link>
                  <Link to="/reservations" class={linkClass('/reservations')}>
                    <Calendar class="h-4 w-4" />
                    All Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" class={linkClass('/dashboard')}>
                    <LayoutDashboard class="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/book" class={linkClass('/book')}>
                    <Calendar class="h-4 w-4" />
                    Book a Table
                  </Link>
                  <Link to="/reservations" class={linkClass('/reservations')}>
                    <Calendar class="h-4 w-4" />
                    My Bookings
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Operations */}
          {user ? (
            <div class="hidden md:flex items-center gap-4">
              <Link
                to="/profile"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
              >
                <UserIcon class="h-4 w-4 text-brand-500" />
                <span>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                class="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 text-sm font-medium transition-all"
              >
                <LogOut class="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div class="hidden md:flex items-center gap-4">
              <Link to="/login" class="text-zinc-400 hover:text-zinc-100 text-sm font-medium">
                Log In
              </Link>
              <Link to="/register" class="btn-primary py-1.5 px-4 text-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div class="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              class="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 focus:outline-none"
            >
              {isOpen ? <X class="h-6 w-6" /> : <Menu class="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div class="md:hidden border-t border-zinc-800/40 bg-zinc-950/95 backdrop-blur-lg">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              user.role === 'admin' ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    Admin Panel
                  </Link>
                  <Link
                    to="/tables"
                    onClick={() => setIsOpen(false)}
                    class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    Manage Tables
                  </Link>
                  <Link
                    to="/reservations"
                    onClick={() => setIsOpen(false)}
                    class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    All Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => setIsOpen(false)}
                    class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    Book a Table
                  </Link>
                  <Link
                    to="/reservations"
                    onClick={() => setIsOpen(false)}
                    class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    My Bookings
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  class="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                >
                  Get Started
                </Link>
              </>
            )}

            {user && (
              <div class="pt-4 pb-2 border-t border-zinc-800/80">
                <div class="flex items-center px-5">
                  <div class="flex-shrink-0">
                    <UserIcon class="h-6 w-6 text-brand-500" />
                  </div>
                  <div class="ml-3">
                    <div class="text-base font-medium text-zinc-100">{user.name}</div>
                    <div class="text-sm font-medium text-zinc-500">{user.email}</div>
                  </div>
                </div>
                <div class="mt-3 px-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    class="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-zinc-900 hover:text-red-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
