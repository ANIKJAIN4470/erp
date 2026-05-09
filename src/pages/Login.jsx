import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertCircle, Command, ArrowRight, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(username, password);
      navigate(`/${userData.role}/dashboard`);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc', // Bright slate background
      padding: '2rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        maxWidth: '440px', 
        width: '100%', 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            marginBottom: '1rem',
            color: '#2563eb'
          }}>
            <Command size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Enterprise Console
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Welcome back. Please enter your details.
          </p>
        </div>

        {error && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#dc2626', 
            backgroundColor: '#fef2f2', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem', 
            fontSize: '0.85rem',
            border: '1px solid #fee2e2'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Enter your username" 
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fcfcfc',
                  color: '#1e293b'
                }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                className="login-input-bright"
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fcfcfc',
                  color: '#1e293b'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="login-input-bright"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
              <input type="checkbox" style={{ borderRadius: '4px' }} /> Remember me
            </label>
            <a href="#" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</a>
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '1rem', 
              marginTop: '0.5rem', 
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Sign in <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.5' }}>
            By signing in, you agree to the Enterprise Data Protection Policy. 
            All activities are logged for security compliance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
