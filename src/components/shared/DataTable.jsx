import React from 'react';

export const DataTable = ({ headers, children, loading, emptyMessage = "No records found" }) => {
  if (loading) {
    return (
      <div className="data-table-container shimmer" style={{ height: '400px' }}></div>
    );
  }

  return (
    <div className="data-table-container animate-fade-in">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
