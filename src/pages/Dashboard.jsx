import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DollarSign, CreditCard, ShieldAlert, Package, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, AlertCircle, Info, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../api';

const StatCard = ({ title, value, icon: Icon, trend, isPositive, loading }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>{title}</div>
      <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
      {loading ? <Loader2 className="animate-spin" size={24} /> : value}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
      {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      <span>{trend}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchTasks();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/dashboard/');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/');
      setTasks((res.results || res).filter(t => t.status !== 'completed').slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <AlertCircle size={48} color="var(--danger)" />
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  const safeData = data || {
    metrics: { total_sales: 0, total_expenses: 0, profit: 0, fraud_alerts: 0 },
    benchmarks: null,
    recommendations: [],
    chart_data: [{ name: "No Data", sales: 0, expense: 0 }],
    fraud_alerts_list: []
  };

  const { metrics, benchmarks, recommendations, chart_data, fraud_alerts_list } = safeData;

  const handleExecuteRecommendation = (rec) => {
    const text = rec.toLowerCase();
    if (text.includes('fraud')) {
      window.location.href = '/fraud';
    } else if (text.includes('inventory') || text.includes('stock')) {
      window.location.href = '/inventory';
    } else if (text.includes('average') || text.includes('sales')) {
      window.location.href = '/benchmark';
    } else {
      alert(`Strategy Initiated: ${rec}`);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Intelligence Hub</h1>
          <p className="page-subtitle">Unified monitoring and AI-driven business insights.</p>
        </div>
        {benchmarks && (
          <div className={`badge ${benchmarks.status === 'Above Average' ? 'badge-success' : benchmarks.status === 'Below Average' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <TrendingUp size={16} style={{ marginRight: '0.5rem' }} />
            System Standing: {benchmarks.status}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard title="Total Sales" value={`$${(metrics?.total_sales || 0).toLocaleString()}`} icon={DollarSign} trend={benchmarks?.sales_comparison || "0%"} isPositive={!(benchmarks?.sales_comparison || "0%").startsWith('-')} loading={loading} />
        <StatCard title="Total Expenses" value={`$${(metrics?.total_expenses || 0).toLocaleString()}`} icon={CreditCard} trend={benchmarks?.expense_comparison || "0%"} isPositive={(benchmarks?.expense_comparison || "0%").startsWith('-')} loading={loading} />
        <StatCard title="Net Profit" value={`$${(metrics?.profit || 0).toLocaleString()}`} icon={Package} trend={benchmarks?.profit_comparison || "0%"} isPositive={(metrics?.profit || 0) >= 0} loading={loading} />
        <StatCard title="Fraud Alerts" value={metrics?.fraud_alerts || 0} icon={ShieldAlert} trend={`${metrics?.fraud_alerts || 0} active flags`} isPositive={(metrics?.fraud_alerts || 0) === 0} loading={loading} />
      </div>

      {/* Today's Work Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <CheckCircle2 color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Today's Work</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{task.title}</span>
                <span className={`badge ${task.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>{task.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{task.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {task.status === 'pending' ? (
                  <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="btn btn-outline" style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem' }}>Start</button>
                ) : (
                  <button onClick={() => updateTaskStatus(task.id, 'completed')} className="btn btn-primary" style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem' }}>Finish</button>
                )}
              </div>
            </div>
          )) : (
            <div className="card" style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No active tasks assigned for today.</div>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>

        <div className="card" style={{ minHeight: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Cash Flow Dynamics</h3>
          <div style={{ width: '100%', height: '300px', position: 'relative' }}>
            <ResponsiveContainer width="99%" height="99%">
              <LineChart data={chart_data || [{ name: "No Data", sales: 0, expense: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" stroke="var(--warning)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Security Center</h3>
          <div style={{ height: '300px', overflowY: 'auto' }}>
            {(fraud_alerts_list && fraud_alerts_list.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {fraud_alerts_list.map(alert => (
                  <div key={alert.id} style={{ padding: '1rem', borderLeft: '4px solid var(--danger)', backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--danger)' }}>High Risk Transaction</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{alert.id}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Amount: <strong>${Number(alert.amount || 0).toLocaleString()}</strong></p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--success)', gap: '1rem' }}>
                <CheckCircle2 size={48} />
                <p>No active security threats detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>AI Strategic Recommendations</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {(recommendations && recommendations.length > 0) ? recommendations.map((rec, index) => {
            const isDanger = rec.toLowerCase().includes('fraud') || rec.toLowerCase().includes('high expense');
            const isWarning = rec.toLowerCase().includes('low inventory') || rec.toLowerCase().includes('below average');
            
            return (
              <div key={index} className="card" style={{ 
                borderLeft: `4px solid ${isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--primary)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {isDanger ? <AlertCircle color="var(--danger)" /> : isWarning ? <AlertCircle color="var(--warning)" /> : <Info color="var(--primary)" />}
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{isDanger ? 'Critical Action' : 'Strategic Insight'}</h3>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {rec}
                </p>
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleExecuteRecommendation(rec)}
                  style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  Execute Recommendation
                </button>
              </div>
            )
          }) : (
            <div className="card" style={{ gridColumn: '1/-1', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
              <p>No recommendations available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
