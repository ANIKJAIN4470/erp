import { useState, useEffect } from 'react';
import { Download, Search, DollarSign, Loader2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/shared/DataTable';
import { Modal } from '../components/shared/Modal';
import { demoTransactions } from '../data/demoData';

const Transactions = () => {
  const { role } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ amount: '', type: 'expense' });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.get('/transactions/');
      const rows = data.results || data || [];
      setTransactions(rows.length ? rows : demoTransactions);
    } catch (err) {
      console.error(err);
      setTransactions(demoTransactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/transactions/', newTransaction);
      setShowModal(false);
      setNewTransaction({ amount: '', type: 'expense' });
      fetchTransactions();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const filtered = transactions.filter(trx => 
    trx.id.toString().includes(searchTerm) || trx.type.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Transaction Ledger</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Real-time financial tracking with integrated AI risk profiling.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="nav-link" style={{ background: 'var(--bg-card)', border: 'none' }}><Download size={16}/> <span>Export</span></button>
          {['admin', 'accountant'].includes(role) && (
            <button className="nav-link active" onClick={() => setShowModal(true)} style={{ border: 'none', cursor: 'pointer' }}>
              <DollarSign size={16} /> <span>Record Transaction</span>
            </button>
          )}
        </div>
      </header>

      <div className="card-premium" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <div className="header-search" style={{ width: '100%' }}>
          <Search size={14} color="var(--text-dim)" />
          <input 
            type="text" 
            placeholder="Search by Transaction ID or Type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        headers={['ID', 'Date', 'Type', 'Amount', 'Risk Score', 'Status']}
        loading={loading}
      >
        {filtered.map(trx => (
          <tr key={trx.id}>
            <td style={{ fontWeight: '700', opacity: 0.8 }}>#{trx.id}</td>
            <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{new Date(trx.timestamp).toLocaleString()}</td>
            <td>
              <span className="risk-tag" style={{ background: 'rgba(255,255,255,0.05)' }}>{trx.type.toUpperCase()}</span>
            </td>
            <td style={{ fontWeight: '700' }}>${Number(trx.amount).toLocaleString()}</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1, height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', minWidth: '60px' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${trx.risk_score}%`, 
                    background: trx.risk_score > 70 ? 'var(--error)' : trx.risk_score > 30 ? 'var(--warning)' : 'var(--success)',
                    borderRadius: '2px' 
                  }}></div>
                </div>
                <span style={{ fontSize: '0.7rem' }}>{trx.risk_score}%</span>
              </div>
            </td>
            <td>
              {trx.is_fraud ? (
                <span className="risk-tag high">Fraud Suspicion</span>
              ) : (
                <span className="risk-tag" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>Verified</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Financial Record">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Amount ($)</label>
            <input 
              type="number" 
              className="card-premium" 
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)' }}
              value={newTransaction.amount}
              onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Type</label>
            <select 
              className="card-premium" 
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
              value={newTransaction.type}
              onChange={e => setNewTransaction({...newTransaction, type: e.target.value})}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <button type="submit" className="nav-link active" style={{ border: 'none', padding: '0.8rem', justifyContent: 'center', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : 'Analyze & Post Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
