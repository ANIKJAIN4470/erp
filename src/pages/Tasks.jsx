import { useState, useEffect } from 'react';
import { 
  ClipboardList, Plus, Calendar, User, 
  CheckCircle2, Play, Loader2
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/shared/Modal';
import { demoTasks, demoEmployees } from '../data/demoData';

const Tasks = () => {
  const { role } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: '', due_date: '' });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.get('/tasks/');
      const rows = data.results || data || [];
      setTasks(rows.length ? rows : demoTasks);
    } catch (err) {
      console.error(err);
      setTasks(demoTasks);
    }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const data = await api.get('/employees/');
      const rows = data.results || data || [];
      setEmployees(rows.length ? rows : demoEmployees);
    } catch (err) {
      console.error(err);
      setEmployees(demoEmployees);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
    if (role === 'admin') fetchEmployees();
  }, [role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tasks/', newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', assigned_to: '', due_date: '' });
      fetchTasks();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/`, { status });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Work Assignments</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Project tracking and resource coordination matrix.</p>
        </div>
        {role === 'admin' && (
          <button className="nav-link active" onClick={() => setShowModal(true)} style={{ border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> <span>Create Assignment</span>
          </button>
        )}
      </header>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3].map(i => <div key={i} className="card-premium shimmer" style={{ height: '180px' }}></div>)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {tasks.map(task => (
            <div key={task.id} className="card-premium animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: task.status === 'completed' ? '4px solid var(--success)' : '4px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{task.title}</h3>
                <span className={`risk-tag ${task.status === 'completed' ? '' : task.status === 'in_progress' ? 'medium' : 'high'}`} style={{ fontSize: '0.65rem' }}>
                  {task.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', flex: 1, lineHeight: '1.5' }}>{task.description}</p>
              
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <Calendar size={12} color="var(--text-dim)"/>
                  <span>Due: <strong style={{ color: 'var(--text-main)' }}>{new Date(task.due_date).toLocaleDateString()}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <User size={12} color="var(--text-dim)"/>
                  <span>{role === 'admin' ? `Assigned to: ${task.assigned_to_name}` : `By: ${task.assigned_by_name}`}</span>
                </div>
              </div>

              {role !== 'admin' && task.status !== 'completed' && (
                <button 
                  className="nav-link active" 
                  style={{ width: '100%', justifyContent: 'center', border: 'none', padding: '0.6rem', marginTop: '0.5rem' }}
                  onClick={() => updateStatus(task.id, task.status === 'pending' ? 'in_progress' : 'completed')}
                >
                  {task.status === 'pending' ? <><Play size={14}/> <span>Start Work</span></> : <><CheckCircle2 size={14}/> <span>Mark Complete</span></>}
                </button>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              <ClipboardList size={48} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <h3 style={{ color: 'var(--text-dim)' }}>No active assignments</h3>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Operational Assignment">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Task Title</label>
            <input 
              type="text" 
              className="card-premium" 
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)' }}
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Instructions</label>
            <textarea 
              className="card-premium" 
              rows="3"
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)', background: 'transparent' }}
              value={newTask.description}
              onChange={e => setNewTask({...newTask, description: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Assign To</label>
              <select 
                className="card-premium" 
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
                value={newTask.assigned_to}
                onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                required
              >
                <option value="">Select Member</option>
                {employees.filter(e => e.user).map(emp => (
                  <option key={emp.id} value={emp.user}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Deadline</label>
              <input 
                type="date" 
                className="card-premium" 
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)' }}
                value={newTask.due_date}
                onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                required
              />
            </div>
          </div>
          <button type="submit" className="nav-link active" style={{ border: 'none', padding: '0.8rem', justifyContent: 'center', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : 'Deploy Assignment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
