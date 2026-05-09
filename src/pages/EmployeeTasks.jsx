import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, CheckCircle2, Play, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.get('/tasks/');
      setTasks(data.results || data);
    } catch (err) {
      setError('Failed to load your tasks.');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning">Pending</span>;
      case 'in_progress': return <span className="badge badge-info">In Progress</span>;
      case 'completed': return <span className="badge badge-success">Completed</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Task Ledger</h1>
        <p className="page-subtitle">Complete history of all work assignments and their current status.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {tasks.length > 0 ? tasks.map(task => (
          <div key={task.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{task.title}</h3>
              {getStatusBadge(task.status)}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>{task.description}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
              <Calendar size={14} color="var(--primary)" />
              <span>Due Date: <strong>{new Date(task.due_date).toLocaleDateString()}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {task.status === 'pending' && (
                <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="btn btn-outline" style={{ flex: 1, fontSize: '0.8rem' }}>
                  <Play size={14} /> Start Working
                </button>
              )}
              {task.status === 'in_progress' && (
                <button onClick={() => updateTaskStatus(task.id, 'completed')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}>
                  <CheckCircle2 size={14} /> Mark Done
                </button>
              )}
              {task.status === 'completed' && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontSize: '0.8rem', gap: '0.5rem', padding: '0.5rem' }}>
                  <CheckCircle2 size={16} /> Task Completed
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
            <ClipboardList size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No tasks assigned yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back later for new assignments from your manager.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTasks;
