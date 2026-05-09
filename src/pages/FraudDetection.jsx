import { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, ShieldCheck, Download, Radar } from 'lucide-react';
import api from '../api';
import { DataTable } from '../components/shared/DataTable';
import { demoFraudTransactions } from '../data/demoData';

const FraudDetection = () => {
  const [fraudData, setFraudData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFraudTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.get('/fraud-transactions/');
      const rows = data.results || data || [];
      setFraudData(rows.length ? rows : demoFraudTransactions);
    } catch (err) {
      console.error(err);
      setFraudData(demoFraudTransactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFraudTransactions();
  }, []);

  const filtered = fraudData.filter(trx => 
    trx.id.toString().includes(searchTerm) ||
    trx.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Security & Neural Audit</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Real-time anomaly detection and cryptographic risk assessment.</p>
        </div>
        <button className="nav-link active" style={{ border: 'none', padding: '0.6rem 1rem' }}>
          <Download size={16} /> <span>Generate Security Report</span>
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card-premium" style={{ borderLeft: '4px solid var(--error)', background: 'rgba(239, 68, 68, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
              <ShieldAlert color="var(--error)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--error)' }}>{fraudData.length}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Active Threats</div>
            </div>
          </div>
        </div>
        <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
            <Radar color="var(--primary)" size={24} className="animate-pulse" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.2rem' }}>AI Monitoring Active</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
              The neural risk engine is analyzing all incoming streams. 
              Suspicious deviations and pattern-matched fraud attempts are flagged for manual review.
            </p>
          </div>
        </div>
      </div>

      <div className="card-premium" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="header-search" style={{ flex: 1, width: 'auto' }}>
            <Search size={14} color="var(--text-dim)" />
            <input 
              type="text" 
              placeholder="Filter security events by ID, type or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="nav-link" style={{ background: 'var(--bg-card-hover)', border: 'none' }}><Filter size={16}/></button>
        </div>
      </div>

      <DataTable 
        headers={['Security Level', 'Event ID', 'Timestamp', 'Magnitude', 'Risk Index', 'Status']}
        loading={loading}
      >
        {filtered.map(trx => (
          <tr key={trx.id}>
            <td>
              <div style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.75rem' }}>
                <ShieldAlert size={14} /> CRITICAL
              </div>
            </td>
            <td style={{ fontWeight: '600', fontSize: '0.85rem' }}>#{trx.id}</td>
            <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(trx.timestamp).toLocaleString()}</td>
            <td style={{ fontWeight: '700', fontSize: '0.85rem' }}>${Number(trx.amount).toLocaleString()}</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: '800', color: 'var(--error)', fontSize: '0.75rem' }}>{trx.risk_score}%</span>
                <div style={{ flex: 1, minWidth: '80px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${trx.risk_score}%`, height: '100%', background: 'var(--error)' }}></div>
                </div>
              </div>
            </td>
            <td>
              <span className="risk-tag high" style={{ fontSize: '0.65rem' }}>FRAUD_SUSPICION</span>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && !loading && (
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>
              <ShieldCheck size={48} color="var(--success)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <h3 style={{ color: 'var(--text-dim)' }}>Perimeter Secure</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No anomalous activity detected in current cycle.</p>
            </td>
          </tr>
        )}
      </DataTable>
    </div>
  );
};

export default FraudDetection;
