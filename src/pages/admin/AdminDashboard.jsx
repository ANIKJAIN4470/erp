import { useState, useEffect } from 'react';
import { Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../../api';
import { demoDashboard } from '../../data/demoData';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/ai/dashboard/');
        setData(response && response.chart_data?.length ? response : demoDashboard);
      } catch (err) {
        console.error('Dashboard fetch failed', err);
        setData(demoDashboard);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="shimmer" style={{ height: '400px', width: '100%', borderRadius: '12px' }}></div>
    </div>
  );

  const safeMetrics = data?.metrics || demoDashboard.metrics;

  return (
    <div className="admin-dashboard animate-fade-in">
      {/* KPI Section */}
      <div className="kpi-grid">
        <div className="card-premium kpi-card">
          <span className="kpi-label">Revenue</span>
          <div className="kpi-value">${safeMetrics.total_sales?.toLocaleString?.() ?? '0'}</div>
          <div className="kpi-trend trend-up">
            <ArrowUpRight size={14}/> 12% <span style={{ color: 'var(--text-dim)', fontWeight: '400' }}>vs last month</span>
          </div>
        </div>
        <div className="card-premium kpi-card">
          <span className="kpi-label">Burn Rate</span>
          <div className="kpi-value">${safeMetrics.total_expenses?.toLocaleString?.() ?? '0'}</div>
          <div className="kpi-trend trend-down">
            <ArrowDownRight size={14}/> 4% <span style={{ color: 'var(--text-dim)', fontWeight: '400' }}>vs last month</span>
          </div>
        </div>
        <div className="card-premium kpi-card">
          <span className="kpi-label">Workforce</span>
          <div className="kpi-value">{safeMetrics.active_employees || 124}</div>
          <div className="kpi-trend" style={{ color: 'var(--info)' }}>
             Stable <span style={{ color: 'var(--text-dim)', fontWeight: '400' }}>capacity</span>
          </div>
        </div>
        <div className="card-premium kpi-card">
          <span className="kpi-label">Risk Level</span>
          <div className="kpi-value" style={{ color: safeMetrics.fraud_alerts > 0 ? 'var(--error)' : 'var(--success)' }}>
            {safeMetrics.fraud_alerts > 0 ? 'Critical' : 'Safe'}
          </div>
          <div className="kpi-trend" style={{ color: 'var(--text-dim)' }}>
            {safeMetrics.fraud_alerts || 0} active alerts
          </div>
        </div>
      </div>

      <div className="dashboard-grid-main">
        <div className="main-content-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Chart Area */}
          <div className="card-premium" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Financial Performance</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Net profit vs operational expenses</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary)' }}></div> Revenue
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--error)', opacity: 0.5 }}></div> Expenses
                </div>
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chart_data || [{ name: "No Data", sales: 0, expense: 0 }]}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="sales" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" stroke="var(--error)" fill="transparent" strokeWidth={1} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity/Fraud Table */}
          <div className="card-premium">
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem' }}>Security Incident Log</h4>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Account</th>
                    <th>Value</th>
                    <th>Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.fraud_alerts_list && data.fraud_alerts_list.length > 0) ? data.fraud_alerts_list.map(alert => (
                    <tr key={alert.id}>
                      <td>{alert.type || 'Unknown'}</td>
                      <td>{alert.company_name || 'N/A'}</td>
                      <td style={{ fontWeight: '600' }}>${alert.amount || 0}</td>
                      <td>
                        <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>
                          CRITICAL
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>No active security threats detected.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="side-content-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Insights - Notion Style */}
          <div className="ai-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Zap size={16} color="var(--primary)" />
              <h5 style={{ fontSize: '0.85rem', fontWeight: '600' }}>AI Recommendations</h5>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(data?.recommendations && data.recommendations.length > 0) ? data.recommendations.map((rec, i) => (
                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                  <div style={{ minWidth: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', marginTop: '0.4rem' }}></div>
                  {rec}
                </li>
              )) : (
                <li style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recommendations available yet.</li>
              )}
            </ul>
          </div>

          {/* Quick Stats / Benchmarks */}
          <div className="card-premium">
            <h5 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.25rem' }}>System Health</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Latency</span>
                <span style={{ color: 'var(--success)' }}>12ms</span>
              </div>
              <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '2px' }}>
                <div style={{ width: '12%', height: '100%', background: 'var(--success)', borderRadius: '2px' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cloud Capacity</span>
                <span>84%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '2px' }}>
                <div style={{ width: '84%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
