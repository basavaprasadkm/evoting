import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const CONSTITUENCIES = [
  'Bangalore North', 'Bangalore South', 'Bangalore Central',
  'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum',
  'Shimoga', 'Tumkur', 'Davanagere', 'Gulbarga', 'Bellary'
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    dateOfBirth: '', constituency: '', aadharNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validateStep1 = () => {
    if (!form.name || !form.email) return toast.error('Please fill all fields.'), false;
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) return toast.error('Invalid email.'), false;
    return true;
  };

  const validateStep2 = () => {
    if (!form.password || !form.confirmPassword) return toast.error('Please fill all fields.'), false;
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters.'), false;
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.'), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dateOfBirth || !form.constituency || !form.aadharNumber) return toast.error('Please fill all fields.');
    if (!/^\d{12}$/.test(form.aadharNumber)) return toast.error('Aadhar must be exactly 12 digits.');
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name, email: form.email, password: form.password,
        dateOfBirth: form.dateOfBirth, constituency: form.constituency,
        aadharNumber: form.aadharNumber
      });
      login(res.data.token, res.data.voter);
      toast.success(`Welcome ${form.name.split(' ')[0]}! Now set up your face.`);
      navigate('/face-setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ background: 'var(--primary)' }}>
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
          <h1>VOTER REGISTRATION</h1>
          <p>Create your secure voter account</p>
        </div>

        {/* Step Indicator */}
        <div className="steps" style={{ marginBottom: '1.5rem' }}>
          {['Personal Info', 'Security', 'Verification'].map((label, i) => (
            <div key={i} className={`step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="As per Aadhar card" value={form.name} onChange={set('name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={set('email')} />
              </div>
              <button type="button" className="btn btn-primary btn-full btn-lg"
                onClick={() => validateStep1() && setStep(2)}>Next →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }}
                  onClick={() => validateStep2() && setStep(3)}>Next →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" value={form.dateOfBirth} onChange={set('dateOfBirth')}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Constituency</label>
                <select className="form-input" value={form.constituency} onChange={set('constituency')}>
                  <option value="">Select your constituency</option>
                  {CONSTITUENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Aadhar Number</label>
                <input className="form-input mono" placeholder="12-digit Aadhar number"
                  value={form.aadharNumber} onChange={set('aadharNumber')} maxLength={12} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={loading}>
                  {loading ? '⚙️ Registering...' : '✅ Complete Registration'}
                </button>
              </div>
            </>
          )}
        </form>

        <hr className="divider" />
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
