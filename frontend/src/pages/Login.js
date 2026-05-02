import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('parent');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/login`, { phone, password, role });
      onLogin({ ...res.data, token: res.data.token });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const roles = [
    { value: 'parent', label: '👨‍👩‍👧 Parent', color: '#22c55e' },
    { value: 'teacher', label: '👨‍🏫 Teacher', color: '#3b82f6' },
    { value: 'admin', label: '⚙️ Admin', color: '#8b5cf6' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', width: '90%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏫</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' }}>School Portal</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in to your account</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: 10, padding: '0.3rem' }}>
          {roles.map(r => (
            <button key={r.value} onClick={() => setRole(r.value)}
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                background: role === r.value ? 'white' : 'transparent',
                color: role === r.value ? r.color : '#64748b',
                boxShadow: role === r.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s' }}>
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: '#475569' }}>
              📱 {role === 'parent' ? 'Parent Phone Number' : 'Phone Number'}
            </label>
            <input className="input" type="tel" placeholder="e.g. 9876543210" value={phone}
              onChange={e => setPhone(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: '#475569' }}>🔒 Password</label>
            <input className="input" type="password" placeholder="Enter password" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.7rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>⚠️ {error}</div>}

          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          {role === 'parent' ? 'Use the phone number registered with school' : 'Contact admin for credentials'}
        </p>
      </div>
    </div>
  );
}
