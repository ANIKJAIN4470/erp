import CopyButton from '../shared/CopyButton';

const EmployeeDetailsPanel = ({ employee, onCopied }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <span className="profile-section-label">Employment Information</span>
      <div className="profile-field">
        <span className="profile-field-label">Employee Name</span>
        <div className="profile-field-value">{employee.name}</div>
      </div>
      <div className="profile-field">
        <span className="profile-field-label">Role</span>
        <div className="profile-field-value">{employee.role}</div>
      </div>
      <div className="profile-field">
        <span className="profile-field-label">Employee ID</span>
        <div className="profile-field-value">
          <span>{employee.employee_id || 'N/A'}</span>
          <CopyButton text={employee.employee_id || ''} onCopied={onCopied} />
        </div>
      </div>
      <div className="profile-field">
        <span className="profile-field-label">Annual Salary</span>
        <div className="profile-field-value">${Number(employee.salary || 0).toLocaleString()}</div>
      </div>
      <div className="profile-field">
        <span className="profile-field-label">Attendance</span>
        <div className="profile-field-value">{employee.attendance}%</div>
      </div>
    </div>
  );
};

export default EmployeeDetailsPanel;
