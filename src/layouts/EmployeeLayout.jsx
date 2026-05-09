import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardList, Calendar, Bell, 
  User as UserIcon, Settings, LogOut, CheckCircle
} from 'lucide-react';

const EmployeeLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Active Tasks', path: '/employee/tasks', icon: ClipboardList },
    { name: 'My Schedule', path: '/employee/calendar', icon: Calendar },
    { name: 'Achievements', path: '/employee/performance', icon: CheckCircle },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="enterprise-layout employee-theme">
      <aside className="sidebar compact">
        <div className="sidebar-brand">
          <div className="brand-icon employee-bg">
            <UserIcon size={20} color="white" />
          </div>
          <span>CloudERP <small>WORKER</small></span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              <item.icon size={20} />
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="notification-trigger">
            <Bell size={20} />
            <span className="dot"></span>
          </div>
          <Link to="/employee/settings" className={`nav-link ${location.pathname === '/employee/settings' ? 'active' : ''}`} style={{ border: 'none', padding: '0.5rem' }}>
            <Settings size={20} />
          </Link>
          <button onClick={handleLogout} className="logout-btn-icon">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="viewport-header personal">
          <div className="greeting">
            <h3>Hello, {localStorage.getItem('username') || 'Member'} 👋</h3>
            <p>You have 3 tasks pending today.</p>
          </div>
          <div className="header-actions">
            <div className="productivity-stat">
              <span className="label">Streak:</span>
              <span className="value">🔥 12 Days</span>
            </div>
            <div className="user-avatar-small">
              {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <div className="viewport-content scrollable">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;
