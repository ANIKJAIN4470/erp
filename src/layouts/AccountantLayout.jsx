import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart, FileText, PieChart, ShieldCheck, 
  ArrowUpRight, Settings, LogOut, Wallet
} from 'lucide-react';

const AccountantLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Finance Hub', path: '/accountant/dashboard', icon: BarChart },
    { name: 'Transactions', path: '/accountant/transactions', icon: ArrowUpRight },
    { name: 'Tax Reports', path: '/accountant/tax', icon: PieChart },
    { name: 'Invoices', path: '/accountant/invoices', icon: FileText },
    { name: 'Fraud Review', path: '/accountant/fraud', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="enterprise-layout accountant-theme">
      <aside className="sidebar accountant-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon accountant-bg">
            <Wallet size={20} color="white" />
          </div>
          <span>CloudERP <small>FINANCE</small></span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/accountant/settings" className={`nav-link ${location.pathname === '/accountant/settings' ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Close Ledger</span>
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="viewport-header glass">
          <div className="financial-ticker">
            <span className="ticker-item">USD/INR: 83.45</span>
            <span className="ticker-item success">Revenue: +12%</span>
          </div>
          <div className="header-actions">
            <div className="accountant-badge">Chief Accountant</div>
          </div>
        </header>
        <div className="viewport-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AccountantLayout;
