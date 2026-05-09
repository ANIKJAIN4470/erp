import React from 'react';
import { Mail, Phone, MapPin, Calendar, ShieldCheck } from 'lucide-react';

const ProfileHeader = ({ employee }) => {
  return (
    <div className="profile-header-premium" style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-strong)', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
          {employee.name.charAt(0)}
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{employee.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="risk-tag" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>{employee.role}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>• {employee.employee_id}</span>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card-premium" style={{ padding: '0.75rem', background: 'transparent' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--success)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
            Active Member
          </div>
        </div>
        <div className="card-premium" style={{ padding: '0.75rem', background: 'transparent' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Performance</div>
          <div className={`risk-tag ${employee.performance_tag === 'warning' ? 'high' : ''}`} style={{ fontSize: '0.75rem', padding: '0 0.5rem' }}>
            {employee.performance_tag.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
