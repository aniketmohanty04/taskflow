import React, { useState } from 'react';
import { authAPI } from '../services/authAPI';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    if (mode === 'register' && !form.name) { setError('Name is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register({ name: form.name, email: form.email, password: form.password });

      const { token, user } = res.data;
      localStorage.setItem('todo_token', token);
      localStorage.setItem('todo_user', JSON.stringify(user));
      onLogin(user, token);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">☑</div>
          <h1 className="auth-logo-text">TO-DO-TRACKER</h1>
        </div>

        <p className="auth-tagline">Track habits. Hit goals. Build streaks.</p>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}>
            Sign In
          </button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}>
            Create Account
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input className="auth-input" type="text" placeholder="Aniket Mohanty"
                value={form.name} onChange={set('name')} autoFocus />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} autoFocus={mode === 'login'} />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} />
            {mode === 'login' && (
              <span className="auth-hint">Minimum 6 characters</span>
            )}
          </div>

          {error && (
            <div className="auth-error">⚠️ {error}</div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? <><span className="auth-spinner" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
              : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'
            }
          </button>
        </form>

        {/* Switch mode */}
        <p className="auth-switch">
          {mode === 'login'
            ? <>Don't have an account? <button className="auth-link" onClick={() => { setMode('register'); setError(''); }}>Create one free</button></>
            : <>Already have an account? <button className="auth-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          }
        </p>

        {/* Features */}
        <div className="auth-features">
          <span>📊 Progress Charts</span>
          <span>📌 Habit Tracking</span>
          <span>☁️ Cloud Sync</span>
        </div>
      </div>
    </div>
  );
}
