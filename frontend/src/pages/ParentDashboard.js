import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import API from '../api';

export default function ParentDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);

  useEffect(() => { API.get('/api/parent/results').then(r => setData(r.data)); }, []);

  const getGrade = (pct) => {
    if (pct >= 90) return { label: 'A+', color: '#16a34a', bg: '#dcfce7' };
    if (pct >= 75) return { label: 'A', color: '#2563eb', bg: '#dbeafe' };
    if (pct >= 60) return { label: 'B', color: '#7c3aed', bg: '#ede9fe' };
    if (pct >= 45) return { label: 'C', color: '#ca8a04', bg: '#fef9c3' };
    return { label: 'F', color: '#dc2626', bg: '#fee2e2' };
  };

  const getBarColor = (pct) => {
    if (pct >= 75) return '#22c55e';
    if (pct >= 45) return '#f59e0b';
    return '#ef4444';
  };

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading results...</p>
      </div>
    </div>
  );

  const avg = data.results.length > 0
    ? Math.round(data.results.reduce((s, r) => s + parseFloat(r.percentage), 0) / data.results.length)
    : 0;

  const chartData = data.results.map(r => ({
    name: r.test_name.length > 12 ? r.test_name.slice(0, 12) + '…' : r.test_name,
    marks: r.marks,
    max: r.max_marks,
    pct: parseFloat(r.percentage)
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>🏫 School Portal</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Parent Dashboard</h1>
        </div>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' }}>
          🚪 Logout
        </button>
      </div>

      <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
        {/* Student Info Card */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #059669, #0d9488)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', fontWeight: 800, flexShrink: 0 }}>
            {data.student.name[0]}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{data.student.name}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Roll No: {data.student.roll_no} · Class: {data.student.class_name || '—'}</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: avg >= 75 ? '#059669' : avg >= 45 ? '#ca8a04' : '#dc2626' }}>{avg}%</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Overall Avg</div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.2rem' }}>📈 Performance Chart</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val, name) => [`${val}%`, 'Score']} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={getBarColor(entry.pct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Results Table */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: 700 }}>📝 Test Results</h3>
          </div>
          {data.results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              No results available yet
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem 1.2rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Test</th>
                  <th style={{ padding: '0.75rem 1.2rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Marks</th>
                  <th style={{ padding: '0.75rem 1.2rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Percentage</th>
                  <th style={{ padding: '0.75rem 1.2rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r, i) => {
                  const grade = getGrade(parseFloat(r.percentage));
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 1.2rem', fontWeight: 600 }}>{r.test_name}</td>
                      <td style={{ padding: '1rem 1.2rem', color: '#64748b' }}>{r.marks} / {r.max_marks}</td>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                          <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, maxWidth: 100 }}>
                            <div style={{ height: '100%', borderRadius: 4, background: getBarColor(parseFloat(r.percentage)), width: `${r.percentage}%` }} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{r.percentage}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <span style={{ background: grade.bg, color: grade.color, padding: '0.2rem 0.7rem', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem' }}>
                          {grade.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
