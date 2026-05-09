import { useState, useEffect } from 'react';
import { 
  UserPlus, Search, Filter, Loader2, ChevronRight
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/shared/DataTable';
import { Modal } from '../components/shared/Modal';
import EmployeeDrawer from '../components/workforce/EmployeeDrawer';
import { demoEmployees } from '../data/demoData';

const Employees = () => {
  const { role } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer & Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', salary: '', attendance: '100' });
  const [error, setError] = useState('');

  async function fetchEmployees() {
    try {
      setLoading(true);
      const data = await api.get('/employees/');
      const rows = data.results || data || [];
      setEmployees(rows.length ? rows : demoEmployees);
    } catch (err) {
      console.error(err);
      setEmployees(demoEmployees);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
  }, []);

  const handleSelectEmployee = async (emp) => {
    try {
      const creds = await api.get(`/employees/${emp.id}/credentials/`);
      setSelectedEmployee({ ...emp, ...creds });
    } catch {
      setSelectedEmployee(emp);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/employees/', {
        ...newEmployee,
        salary: parseFloat(newEmployee.salary),
        attendance: parseInt(newEmployee.attendance)
      });
      setShowAddModal(false);
      setNewEmployee({ name: '', role: '', salary: '', attendance: '100' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to onboard employee. Ensure all fields are valid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Workforce Matrix</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Real-time coordination and performance oversight for enterprise personnel.</p>
        </div>
        {role === 'admin' && (
          <button className="nav-link active" onClick={() => setShowAddModal(true)} style={{ border: 'none', cursor: 'pointer', padding: '0.6rem 1rem' }}>
            <UserPlus size={16} /> <span>Onboard Member</span>
          </button>
        )}
      </header>

      <div className="card-premium" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="header-search" style={{ flex: 1, width: 'auto' }}>
            <Search size={14} color="var(--text-dim)" />
            <input 
              type="text" 
              placeholder="Search team by name, role or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="nav-link" style={{ background: 'var(--bg-card-hover)', border: 'none' }}><Filter size={16}/></button>
        </div>
      </div>

      <DataTable 
        headers={['Team Member', 'Position', 'Department', 'Status', '']}
        loading={loading}
      >
        {filtered.map(emp => (
          <tr 
            key={emp.id} 
            onClick={() => handleSelectEmployee(emp)} 
            style={{ cursor: 'pointer' }}
            className="hover-row"
          >
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', color: 'white' }}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{emp.employee_id}</div>
                </div>
              </div>
            </td>
            <td><span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{emp.role}</span></td>
            <td><span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Operations</span></td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--success)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
                Active
              </div>
            </td>
            <td style={{ textAlign: 'right' }}>
              <ChevronRight size={16} color="var(--text-dim)" />
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Profile Drawer */}
      <EmployeeDrawer 
        isOpen={!!selectedEmployee} 
        onClose={() => setSelectedEmployee(null)} 
        employee={selectedEmployee} 
      />

      {/* Onboarding Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Team Expansion: Onboard Member">
        <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div style={{ color: 'var(--error)', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
          
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block', fontWeight: '700' }}>Full Name</label>
            <input 
              type="text" 
              className="card-premium" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
              value={newEmployee.name}
              onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
              required
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block', fontWeight: '700' }}>Designation</label>
            <input 
              type="text" 
              className="card-premium" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
              value={newEmployee.role}
              onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
              required
              placeholder="e.g. Senior Architect"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block', fontWeight: '700' }}>Salary ($)</label>
              <input 
                type="number" 
                className="card-premium" 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
                value={newEmployee.salary}
                onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block', fontWeight: '700' }}>Initial Attendance (%)</label>
              <input 
                type="number" 
                className="card-premium" 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
                value={newEmployee.attendance}
                onChange={e => setNewEmployee({...newEmployee, attendance: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="nav-link active" style={{ border: 'none', padding: '0.9rem', justifyContent: 'center', marginTop: '1rem', fontWeight: '700' }} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : 'Deploy Onboarding Sequence'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
