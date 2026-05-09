import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Edit2, Ban, Share2 } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import ActivityTimeline from './ActivityTimeline';
import EmployeeDetailsPanel from './EmployeeDetailsPanel';
import LoginCredentialsCard from './LoginCredentialsCard';

const EmployeeDrawer = ({ isOpen, onClose, employee }) => {
  const portalUrl = 'http://localhost:5173/employee-login';
  const [toastMessage, setToastMessage] = React.useState('');
  if (!employee) return null;

  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 1800);
  };

  const copyFullDetails = () => {
    const details = `
CloudERP Employee Details

Employee Name: ${employee.name}
ID: ${employee.employee_id}
ROLE: ${employee.role}
EMAIL: ${employee.office_email}
SALARY: $${employee.salary}
PERFORMANCE: ${employee.performance_tag}
    `.trim();
    navigator.clipboard.writeText(details);
  };

  const copyLoginCredentials = () => {
    const creds = `CloudERP Employee Login Details

Employee Name: ${employee.name}
Login ID: ${employee.employee_login_id}
Password: ${employee.temporary_password}

Employee Portal:
${portalUrl}
    `.trim();
    navigator.clipboard.writeText(creds);
    showToast('Login credentials copied');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="drawer-overlay"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="drawer-panel"
          >
            <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', zIndex: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dim)' }}>
              <X size={16} />
            </button>

            <ProfileHeader employee={employee} />

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <button className="copy-btn-premium" onClick={copyFullDetails}><Share2 size={12}/> Copy Details</button>
                <button className="copy-btn-premium" onClick={copyLoginCredentials}><Share2 size={12}/> Copy Credentials</button>
                <button className="copy-btn-premium" style={{ color: 'var(--primary)' }}><Send size={12}/> Email</button>
                <button className="copy-btn-premium" style={{ color: 'var(--warning)' }}><AlertCircle size={12}/> Warn</button>
                <button className="copy-btn-premium" style={{ color: 'var(--error)' }}><Ban size={12}/> Suspend</button>
              </div>

              <LoginCredentialsCard
                employee={employee}
                portalUrl={portalUrl}
                onCopyAll={copyLoginCredentials}
                onCopied={() => showToast('Copied to clipboard')}
              />
              <EmployeeDetailsPanel employee={employee} onCopied={() => showToast('Copied to clipboard')} />

              {/* Section 4: Timeline */}
              <ActivityTimeline employee={employee} />
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)', marginTop: '1rem' }}>
              <button className="nav-link active" style={{ width: '100%', justifyContent: 'center', border: 'none', padding: '0.75rem' }}>
                <Edit2 size={16} /> <span>Edit Full Profile</span>
              </button>
            </div>
            {toastMessage && (
              <div
                style={{
                  position: 'absolute',
                  right: '1.5rem',
                  bottom: '1.5rem',
                  background: 'rgba(16, 185, 129, 0.95)',
                  color: '#fff',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                }}
              >
                {toastMessage}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmployeeDrawer;
