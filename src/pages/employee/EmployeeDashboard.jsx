import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Calendar, Clock, Trophy, 
  Flame, CheckCircle2, Play, Circle
} from 'lucide-react';
import api from '../../api';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const data = await api.get('/tasks/');
        setTasks(data.results || data);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, []);

  const activeTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="employee-dashboard animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Good morning, {localStorage.getItem('username')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>You have {activeTasks.length} tasks to focus on today.</p>
      </header>

      {/* Focus Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Streak</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={18} color="#ff4d4d" />
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>12 Days</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Efficiency</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={18} color="#ffcc00" />
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>94%</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Completed</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>24</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
        {/* Task List */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Next for you</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{activeTasks.length} total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div className="shimmer" style={{ height: '80px', borderRadius: '8px' }}></div>
            ) : activeTasks.length > 0 ? activeTasks.map(task => (
              <div key={task.id} className="card-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Circle size={14} color="var(--text-dim)" style={{ marginTop: '0.2rem' }} />
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>{task.title}</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{task.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-dim)' }}>No active tasks. Take a break!</p>
              </div>
            )}
          </div>
        </section>

        {/* Side Info */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card-premium" style={{ background: 'var(--bg-sidebar)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem' }}>Daily Schedule</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', minWidth: '45px' }}>09:00</span>
                <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>Team Sync</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Google Meet</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', minWidth: '45px' }}>11:30</span>
                <div style={{ borderLeft: '2px solid transparent', paddingLeft: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>Deep Work</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Project Phoenix</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-premium">
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem' }}>Achievements</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div title="Fast Responder" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justify-content: 'center' }}>⚡</div>
              <div title="Team Player" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justify-content: 'center' }}>🤝</div>
              <div title="Deadline Master" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justify-content: 'center' }}>🎯</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
