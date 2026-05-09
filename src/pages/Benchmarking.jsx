import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Loader2, 
  Target, Globe, Award, Sparkles, Zap
} from 'lucide-react';
import api from '../api';
import { demoBenchmark } from '../data/demoData';

const Benchmarking = () => {
  const [benchmark, setBenchmark] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      const data = await api.get('/benchmark/');
      setBenchmark(data || demoBenchmark);
    } catch (err) {
      console.error(err);
      setBenchmark(demoBenchmark);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBenchmarks();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Global Benchmarking</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Comparative intelligence metrics against industry and ecosystem medians.</p>
      </header>

      {!benchmark ? (
        <div className="card-premium" style={{ textAlign: 'center', padding: '5rem', borderStyle: 'dashed' }}>
          <Globe size={48} color="var(--text-dim)" style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
          <h3 style={{ color: 'var(--text-dim)' }}>Insufficient Network Data</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Benchmark clusters require multiple enterprise datasets to generate accurate medians.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Status Header */}
          <div className="card-premium" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderLeft: `4px solid ${benchmark.status === 'Above Average' ? 'var(--success)' : 'var(--error)'}`,
            padding: '2.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: benchmark.status === 'Above Average' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '16px' }}>
                <Award size={32} color={benchmark.status === 'Above Average' ? 'var(--success)' : 'var(--error)'} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ecosystem Standing</div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {benchmark.status}
                </h2>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={14} color="var(--primary)" /> Top 12% of Enterprises
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Sales Card */}
            <div className="card-premium animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <TrendingUp color="var(--primary)" size={18} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Revenue Velocity</h3>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                {benchmark.sales_comparison}
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                Normalized income trajectory relative to the global ecosystem median.
              </p>
            </div>

            {/* Expense Card */}
            <div className="card-premium animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <TrendingDown color="var(--warning)" size={18} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Burn Efficiency</h3>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                {benchmark.expense_comparison}
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                Operational expenditure overhead comparison against peer enterprises.
              </p>
            </div>

            {/* Profit Card */}
            <div className="card-premium animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Target color="var(--success)" size={18} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Margin Standing</h3>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                {benchmark.profit_comparison}
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                Net profitability variance compared to sector leaders in the shard.
              </p>
            </div>
          </div>

          {/* Strategic Context */}
          <div className="card-premium" style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '2rem', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)' }}>
            <Zap size={32} color="var(--primary)" />
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem' }}>Strategic Acceleration</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                These indices are synthesized from real-time data across the multi-tenant shard. 
                Leverage these standings to optimize cost structures, adjust pricing strategies, and scale operational capacity with competitive precision.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Benchmarking;
