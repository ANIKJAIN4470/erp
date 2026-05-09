import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

const Topbar = () => {
  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '300px' }}>
        <div style={{ 
          position: 'relative', 
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search anywhere..." 
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px var(--primary-light)';
              e.target.style.backgroundColor = 'var(--surface)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
              e.target.style.backgroundColor = 'var(--bg-color)';
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button style={{
          background: 'none',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          color: 'var(--text-muted)'
        }}>
          <Bell size={24} />
          <span style={{
            position: 'absolute',
            top: '0',
            right: '2px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--danger)',
            borderRadius: '50%',
            border: '2px solid var(--surface)'
          }}></span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '1.5rem',
          borderLeft: '1px solid var(--border-color)',
          cursor: 'pointer'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Jane Doe</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin</div>
          </div>
          <UserCircle size={36} color="var(--primary)" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
