import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CreditCard, 
  ShieldAlert, 
  BarChart3, 
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import api from '../api';

const SidebarItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1.25rem',
      borderRadius: 'var(--radius-md)',
      color: 'inherit',
      textDecoration: 'none',
      fontSize: '0.925rem',
      fontWeight: '500',
      transition: 'var(--transition-fast)',
      marginBottom: '0.25rem',
      position: 'relative'
    }}
  >
    <Icon size={20} />
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span style={{ 
        backgroundColor: 'var(--primary)', 
        color: 'white', 
        fontSize: '0.65rem', 
        padding: '2px 6px', 
        borderRadius: '10px',
        fontWeight: 'bold'
      }}>
        {badge}
      </span>
    )}
  </NavLink>
);

const Sidebar = () => {
  const handleLogout = () => {
    api.removeToken();
    window.location.href = '/login';
  };

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        padding: '0.5rem 0.5rem 2rem 0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          backgroundColor: 'var(--primary)', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <ShieldAlert size={22} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
          CloudERP
        </h1>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Main Menu</p>
        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem to="/employees" icon={Users} label="Employees" />
        <SidebarItem to="/inventory" icon={Package} label="Inventory" badge="Low" />
        <SidebarItem to="/transactions" icon={CreditCard} label="Transactions" />
        
        <p style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', margin: '2rem 0 1rem 0', paddingLeft: '0.5rem' }}>Intelligence</p>
        <SidebarItem to="/fraud-detection" icon={ShieldAlert} label="Fraud Analysis" />
        <SidebarItem to="/benchmarking" icon={BarChart3} label="Benchmarking" />
        <SidebarItem to="/recommendations" icon={Sparkles} label="AI Recommendations" />
      </nav>

      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <SidebarItem to="/settings" icon={Settings} label="Settings" />
        <button 
          onClick={handleLogout}
          className="sidebar-item" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.875rem 1.25rem', 
            borderRadius: 'var(--radius-md)', 
            border: 'none', 
            background: 'none', 
            width: '100%', 
            cursor: 'pointer',
            color: 'var(--danger)',
            fontWeight: '600',
            transition: 'var(--transition-fast)'
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-item:hover {
          background-color: var(--primary-light) !important;
          color: var(--primary) !important;
          transform: translateX(4px);
        }
        .sidebar-item.active {
          background-color: var(--primary) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
      `}} />
    </aside>
  );
};

export default Sidebar;
