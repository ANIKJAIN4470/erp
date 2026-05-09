import { Lock, Share2 } from 'lucide-react';
import CopyButton from '../shared/CopyButton';

const LoginCredentialsCard = ({ employee, portalUrl, onCopyAll, onCopied }) => {
  return (
    <div
      style={{
        position: 'sticky',
        top: '1rem',
        marginBottom: '2rem',
        padding: '1.25rem',
        background: 'linear-gradient(180deg, rgba(99,102,241,0.12) 0%, rgba(18,18,20,1) 38%)',
        borderRadius: '12px',
        border: '1px solid rgba(99,102,241,0.25)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Lock size={16} style={{ color: 'var(--primary)' }} />
        <span className="profile-section-label" style={{ marginBottom: 0 }}>LOGIN CREDENTIALS</span>
      </div>

      <div className="profile-field">
        <span className="profile-field-label">Employee Login ID</span>
        <div className="profile-field-value">
          <span style={{ fontFamily: 'monospace' }}>{employee.employee_login_id || 'N/A'}</span>
          <CopyButton text={employee.employee_login_id || ''} onCopied={onCopied} />
        </div>
      </div>

      <div className="profile-field">
        <span className="profile-field-label">Temporary Password</span>
        <div className="profile-field-value">
          <span style={{ fontFamily: 'monospace' }}>{employee.temporary_password || 'N/A'}</span>
          <CopyButton text={employee.temporary_password || ''} onCopied={onCopied} />
        </div>
      </div>

      <div className="profile-field">
        <span className="profile-field-label">Employee Portal URL</span>
        <div className="profile-field-value">
          <span style={{ fontSize: '0.78rem' }}>{portalUrl}</span>
          <CopyButton text={portalUrl} onCopied={onCopied} />
        </div>
      </div>

      <button
        onClick={onCopyAll}
        className="copy-btn-premium"
        style={{
          width: '100%',
          marginTop: '1rem',
          justifyContent: 'center',
          padding: '0.75rem',
          borderRadius: '10px',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
        }}
      >
        <Share2 size={14} /> Copy Login Credentials
      </button>
    </div>
  );
};

export default LoginCredentialsCard;
