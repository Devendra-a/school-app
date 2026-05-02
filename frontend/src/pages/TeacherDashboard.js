import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api';

// ---- CREATE TEST ----
function CreateTest() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: '', class_id: '', max_marks: 100 });
  const [success, setSuccess] = useState('');

  useEffect(() => { API.get('/api/teacher/classes').then(r => setClasses(r.data)); }, []);

  const create = async () => {
    await API.post('/api/teacher/tests', form);
    setSuccess('Test created successfully!');
    setForm({ name: '', class_id: '', max_marks: 100 });
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>📝 Create New Test</h2>
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="form-group">
          <label>Test Name</label>
          <input className="input" placeholder="e.g. Unit Test 1, Mid Term" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Class</label>
            <select className="input" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Max Marks</label>
            <input className="input" type="number" value={form.max_marks} onChange={e => setForm({ ...form, max_marks: e.target.value })} />
          </div>
        </div>
        {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.7rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>✅ {success}</div>}
        <button className="btn btn-primary" onClick={create}>Create Test</button>
      </div>
    </div>
  );
}

// ---- ENTER MARKS ----
function EnterMarks() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { API.get('/api/teacher/tests').then(r => setTests(r.data)); }, []);

  const loadStudents = async (test) => {
    setSelectedTest(test);
    const res = await API.get(`/api/teacher/tests/${test.id}/students`);
    setStudents(res.data);
    const m = {};
    res.data.forEach(s => { if (s.marks >= 0) m[s.id] = s.marks; });
    setMarks(m);
  };

  const saveMarks = async () => {
    const marksArr = Object.entries(marks).map(([student_id, marks]) => ({ student_id: parseInt(student_id), marks: parseInt(marks) }));
    await API.post('/api/teacher/marks', { test_id: selectedTest.id, marks: marksArr });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getGrade = (marks, max) => {
    const pct = (marks / max) * 100;
    if (pct >= 90) return { label: 'A+', color: '#16a34a' };
    if (pct >= 75) return { label: 'A', color: '#2563eb' };
    if (pct >= 60) return { label: 'B', color: '#7c3aed' };
    if (pct >= 45) return { label: 'C', color: '#ca8a04' };
    return { label: 'F', color: '#dc2626' };
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>✏️ Enter Marks</h2>

      {!selectedTest ? (
        <div>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>Select a test to enter marks:</p>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {tests.map(t => (
              <div key={t.id} className="card" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => loadStudents(t)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{t.class_name} · Max: {t.max_marks} marks</div>
                </div>
                <span style={{ color: '#4f46e5' }}>→</span>
              </div>
            ))}
            {tests.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#94a3b8' }}>No tests created yet. Create a test first!</div>}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-outline" onClick={() => setSelectedTest(null)}>← Back</button>
            <div>
              <h3 style={{ fontWeight: 700 }}>{selectedTest.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{selectedTest.class_name} · Max: {selectedTest.max_marks} marks</p>
            </div>
          </div>

          <div className="card">
            <table>
              <thead><tr><th>Roll No</th><th>Student Name</th><th>Marks (out of {selectedTest.max_marks})</th><th>Grade</th></tr></thead>
              <tbody>
                {students.map(s => {
                  const m = marks[s.id];
                  const grade = m !== undefined ? getGrade(m, selectedTest.max_marks) : null;
                  return (
                    <tr key={s.id}>
                      <td>{s.roll_no}</td>
                      <td><strong>{s.name}</strong></td>
                      <td>
                        <input type="number" min={0} max={selectedTest.max_marks} value={marks[s.id] ?? ''}
                          onChange={e => setMarks({ ...marks, [s.id]: e.target.value })}
                          style={{ width: 80, padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: 6 }} />
                      </td>
                      <td>
                        {grade && <span style={{ fontWeight: 700, color: grade.color }}>{grade.label}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              {saved && <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ Marks saved!</span>}
              <button className="btn btn-success" onClick={saveMarks}>💾 Save All Marks</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- VIEW ALL TESTS ----
function ViewTests() {
  const [tests, setTests] = useState([]);
  useEffect(() => { API.get('/api/teacher/tests').then(r => setTests(r.data)); }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>📋 All Tests</h2>
      <div className="card">
        <table>
          <thead><tr><th>#</th><th>Test Name</th><th>Class</th><th>Max Marks</th><th>Created</th></tr></thead>
          <tbody>
            {tests.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td><strong>{t.name}</strong></td>
                <td><span className="badge badge-blue">{t.class_name}</span></td>
                <td>{t.max_marks}</td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {tests.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No tests yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TeacherDashboard({ user, onLogout }) {
  return (
    <Layout user={user} onLogout={onLogout} color="#0369a1"
      navItems={[
        { key: 'create', label: 'Create Test', icon: '📝', component: CreateTest },
        { key: 'marks', label: 'Enter Marks', icon: '✏️', component: EnterMarks },
        { key: 'tests', label: 'All Tests', icon: '📋', component: ViewTests },
      ]}
    />
  );
}
