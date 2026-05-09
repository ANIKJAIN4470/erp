import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, Boxes, Truck, AlertTriangle, 
  Layers, Settings, LogOut, BarChart3
} from 'lucide-react';

const InventoryLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Stock Center', path: '/inventory/dashboard', icon: Layers },
    { name: 'SKU Manager', path: '/inventory/products', icon: Package },
    { name: 'Warehouse', path: '/inventory/warehouse', icon: Boxes },
    { name: 'Shipments', path: '/inventory/logistics', icon: Truck },
    { name: 'Analytics', path: '/inventory/stats', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="enterprise-layout inventory-theme">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon inventory-bg">
            <Boxes size={20} color="white" />
          </div>
          <span>CloudERP <small>LOGISTICS</small></span>
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
          <Link to="/inventory/settings" className={`nav-link ${location.pathname === '/inventory/settings' ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>End Shift</span>
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="viewport-header inventory-header">
          <div className="warehouse-selector">
            <select>
              <option>Main Warehouse (W1)</option>
              <option>Distribution Center (W2)</option>
            </select>
          </div>
          <div className="header-actions">
            <div className="inventory-badge">Inventory Controller</div>
          </div>
        </header>
        <div className="viewport-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default InventoryLayout;
