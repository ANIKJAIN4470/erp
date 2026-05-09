import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Calendar, Sparkles, Loader2, ClipboardList } from 'lucide-react';
import api from '../api';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, recRes] = await Promise.all([
        api.get('/tasks/'),
        api.get('/recommendations/')
      ]);
      setTasks((taskRes.results || taskRes).filter(t => t.status !== 'completed'));
      setRecommendations(recRes.results || recRes);
    } catch (err) {
      console.error('Failed to fetch employee dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Welcome Back!</h1>
        <p className="page-subtitle">Here's an overview of your active assignments and insights.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Active Tasks Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <ClipboardList color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Active Tasks</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '1rem' }}>{task.title}</h3>
                  <span className={`badge ${task.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}>{task.status}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{task.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {task.status === 'pending' ? (
                      <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Start Task</button>
                    ) : (
                      <button onClick={() => updateTaskStatus(task.id, 'completed')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Mark Complete</button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>All caught up! No active tasks.</p>
              </div>
            )}
          </div>
        </section>

        {/* AI Insights Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Sparkles color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>AI Insights for You</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.length > 0 ? recommendations.map((rec, index) => (
              <div key={index} className="card" style={{ backgroundColor: 'var(--primary-light)', border: 'none' }}>
                <p style={{ fontSize: '0.925rem', color: 'var(--primary)', fontWeight: '500', lineHeight: '1.5' }}>{rec}</p>
              </div>
            )) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>Waiting for new insights...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
