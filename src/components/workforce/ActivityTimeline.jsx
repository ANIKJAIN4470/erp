import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, LogIn } from 'lucide-react';

const ActivityTimeline = ({ employee }) => {
  // Mock activities for demonstration - in a real app, these would come from the AuditLog API
  const activities = [
    { type: 'task', label: 'Assigned: Quarterly Audit', time: '2 hours ago', icon: Clock, color: 'var(--primary)' },
    { type: 'login', label: 'Recent Login: Mumbai, IN', time: '5 hours ago', icon: LogIn, color: 'var(--success)' },
    { type: 'performance', label: 'Performance Badge: Excellent', time: '2 days ago', icon: CheckCircle2, color: 'var(--success)' },
    { type: 'warning', label: 'Warning Issued: Late Submission', time: '1 week ago', icon: AlertTriangle, color: 'var(--warning)' },
  ];

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <span className="profile-section-label">Activity Timeline</span>
      <div style={{ marginTop: '1rem' }}>
        {activities.map((act, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-dot" style={{ background: act.color }}></div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>{act.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{act.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
