// src/components/Layout.jsx
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut, 
  User,
  Building,
  Shield,
  Compass
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Village Schemes', path: '/products', icon: FileText },
    { name: 'Office Profile', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogoutClick = () => {
    onLogout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Officer Admin Console';
      case '/products':
        return 'Village Schemes & Audits';
      case '/settings':
        return 'Office Configurations';
      default:
        return 'GRAM Administration';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="logo-container" onClick={() => navigate('/')}>
          <div className="logo-icon bg-[#C98A2E] shadow-[#C98A2E]/20">
            <Compass size={20} color="#16241D" />
          </div>
          <span className="logo-text font-heading font-black text-xl text-[#F2F0E6]">GRAM</span>
        </div>

        <nav className="flex-grow">
          <ul className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile footer */}
        <div className="user-footer border-[#F2F0E6]/10">
          <div className="user-info">
            <div className="user-avatar bg-[#C98A2E] text-[#16241D]">
              <User size={16} />
            </div>
            <div className="user-details">
              <p className="user-email text-[#F2F0E6]" title={user?.email}>{user?.email}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[#F2F0E6]/60">
                <Shield size={10} className="inline text-[#C98A2E]" />
                <span className="text-[10px] font-semibold text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px] inline-block align-middle">
                  {user?.role === 'Panchayat' ? 'Panchayat Secretary' : user?.role || 'Officer'} (LGD: {user?.lgdCode})
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogoutClick} 
            className="logout-btn border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white"
            title="Log out from session"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="workspace">
        <header className="workspace-header glass">
          <h1 className="header-title font-heading text-lg font-bold">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#24382C] border border-[#F2F0E6]/10 text-xs">
              <div className="sync-indicator-dot active bg-[#C98A2E] shadow-[#C98A2E]"></div>
              <span className="text-[#F2F0E6]/80 font-medium select-none">Live Connection</span>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="flex-grow overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
