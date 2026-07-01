import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ voterId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.voterId || !form.password) return toast.error('Please fill all fields.');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.voter);
      toast.success(`Welcome back, ${res.data.voter.name.split(' ')[0]}!`);
      if (!res.data.voter.isFaceRegistered) {
        navigate('/face-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ background: 'var(--primary)' }}>
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗳️</div>
          <h1>SECUREVOTE</h1>
          <p>Enter your credentials to access your voter account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Voter ID or Email</label>
            <input
              className="form-input"
              placeholder="VOTER-XXXXXXXX or email@example.com"
              value={form.voterId}
              onChange={e => setForm({ ...form, voterId: e.target.value })}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⚙️ Verifying...' : '🔐 Login'}
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          New voter? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
