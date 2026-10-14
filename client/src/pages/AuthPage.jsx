import React, { useState } from 'react';
import { User, Lock, Mail, Building, GraduationCap, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

const BRANCHES = ['CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function AuthPage({ onAuthSuccess, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('2nd Year');
  const [college, setCollege] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const data = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          branch,
          year,
          college: college.trim()
        });
        if (onAuthSuccess) onAuthSuccess(data.user);
      } else {
        if (!email || !password) {
          throw new Error('Email and password are required.');
        }
        const data = await api.login({
          email: email.trim(),
          password
        });
        if (onAuthSuccess) onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo logins
  const handleQuickLogin = async (type) => {
    setError('');
    setLoading(true);
    try {
      if (type === 'admin') {
        const data = await api.login({
          email: 'admin@noteshub.com',
          password: 'admin123'
        });
        if (onAuthSuccess) onAuthSuccess(data.user);
      } else {
        const data = await api.login({
          email: 'student@college.edu',
          password: 'student123'
        });
        if (onAuthSuccess) onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: '480px' }}>
      <div className="card" style={{ padding: '2.5rem', background: 'white' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.35rem' }}>
            {isRegister ? 'Create Student Account' : 'Welcome to Notes Hub'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isRegister
              ? 'Join thousands of engineering students sharing college notes'
              : 'Sign in to access favorites, upload notes & track downloads'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: '#f1f5f9',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: !isRegister ? 'white' : 'transparent',
              fontWeight: !isRegister ? 700 : 500,
              color: !isRegister ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isRegister ? 'white' : 'transparent',
              fontWeight: isRegister ? 700 : 500,
              color: isRegister ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Branch</label>
                  <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Year</label>
                  <select className="form-control" value={year} onChange={(e) => setYear(e.target.value)}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">College / University Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. State Engineering College"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Register & Get Started' : 'Sign In to Account'}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Instant Testing (Pre-seeded Accounts)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.775rem' }}
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="btn btn-outline-primary btn-sm"
              style={{ fontSize: '0.775rem' }}
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
