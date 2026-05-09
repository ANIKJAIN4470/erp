import React, { useState, useEffect } from 'react';
import { 
  Wallet, FileText, ArrowUpRight, ArrowDownLeft, 
  ShieldCheck, Calculator, Receipt, PieChart 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../../api';

const AccountantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/ai/dashboard/'); // Sharing metrics for now
        setData(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="accountant-dashboard animate-fade-in">
      <div className="finance-summary-grid">
        <div className="f-card glass">
          <label>Total Cash Flow</label>
          <h3>${(data?.metrics?.total_sales + data?.metrics?.total_expenses)?.toLocaleString() || '0'}</h3>
          <div className="f-split">
            <span className="inc"><ArrowUpRight size={14}/> {data?.metrics?.total_sales}</span>
            <span className="exp"><ArrowDownLeft size={14}/> {data?.metrics?.total_expenses}</span>
          </div>
        </div>
        <div className="f-card glass">
          <label>Pending Invoices</label>
          <h3>14</h3>
          <p className="sub">Value: $12,400</p>
        </div>
        <div className="f-card glass">
          <label>Tax/GST Reserve</label>
          <h3>$4,500</h3>
          <p className="sub">Estimate for Q2</p>
        </div>
      </div>

      <div className="accountant-grid">
        {/* Transaction Queue */}
        <div className="transaction-section glass">
          <div className="section-header">
            <h4>Recent Transactions</h4>
            <button className="btn-small">View Ledger</button>
          </div>
          <div className="ledger-table">
            <div className="l-header">
              <span>Date</span>
              <span>Category</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {/* Using mock data for demo, will connect to transactions API */}
            <div className="l-row">
              <span>May 08</span>
              <span>Office Supplies</span>
              <span className="neg">-$250</span>
              <span className="status-tag verified">Verified</span>
            </div>
            <div className="l-row">
              <span>May 07</span>
              <span>Client Payment</span>
              <span className="pos">+$5,000</span>
              <span className="status-tag pending">Pending</span>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="accountant-side">
          <div className="widget glass fraud-queue">
            <div className="widget-header">
              <ShieldCheck size={18} color="var(--error)" />
              <h4>Fraud Review Queue</h4>
            </div>
            <p className="alert-text">3 transactions flagged by AI</p>
            <button className="review-btn">Open Audit Tool</button>
          </div>

          <div className="widget glass distribution">
            <h4>Expense Distribution</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={[{n: 'Ops', v: 40}, {n: 'Sal', v: 30}, {n: 'Tax', v: 20}, {n: 'Misc', v: 10}]}>
                <Bar dataKey="v">
                  {[0,1,2,3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <XAxis dataKey="n" hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
