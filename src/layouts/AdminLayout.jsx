import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ArrowLeftRight, Package, 
  ShieldAlert, BarChart3, ClipboardList, Settings, LogOut, Command, Search
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Workforce', path: '/admin/employees', icon: Users },
    { name: 'Ledger', path: '/admin/transactions', icon: ArrowLeftRight },
    { name: 'Stock', path: '/admin/inventory', icon: Package },
    { name: 'Security', path: '/admin/fraud', icon: ShieldAlert },
    { name: 'Insights', path: '/admin/performance', icon: BarChart3 },
    { name: 'Tasks', path: '/admin/tasks', icon: ClipboardList },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="enterprise-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo"><Command size={18} color="white" /></div>
          <span className="brand-text">CloudERP</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Management</div>
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              <item.icon size={16} />
              <span>{item.name}</span>
            </Link>
          ))}
          
          <div className="nav-section-label">Intelligence</div>
          {navItems.slice(4).map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              <item.icon size={16} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin/settings" className={`nav-link ${location.pathname === '/admin/settings' ? 'active' : ''}`}>
            <Settings size={16} />
            <span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="viewport-header">
          <div className="header-search">
            <Search size={14} color="var(--text-dim)" />
            <input type="text" placeholder="Search enterprise..." />
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Admin Console</span>
            <div className="user-avatar" style={{ width: '28px', height: '28px', background: 'var(--border-strong)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700' }}>AD</div>
          </div>
        </header>
        <div className="viewport-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
