import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api';

// ---- OVERVIEW ----
function Overview() {
  const [stats, setStats] = useState({});
  useEffect(() => { API.get('/api/admin/dashboard').then(r => setStats(r.data)); }, []);
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>📊 Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Classes', value: stats.classes, icon: '🏛️', color: '#4f46e5' },
          { label: 'Total Teachers', value: stats.teachers, icon: '👨‍🏫', color: '#0891b2' },
          { label: 'Total Students', value: stats.students, icon: '👨‍🎓', color: '#059669' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div className="stat-num" style={{ color: s.color }}>{s.value ?? '...'}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- CLASSES ----
function Classes() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', section: '' });

  const load = () => API.get('/api/admin/classes').then(r => setClasses(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    await API.post('/api/admin/classes', form);
    setShowModal(false); setForm({ name: '', section: '' }); load();
  };

  const del = async (id) => {
    if (window.confirm('Delete this class?')) { await API.delete(`/api/admin/classes/${id}`); load(); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>🏛️ Classes</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Class</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>#</th><th>Class Name</th><th>Section</th><th>Action</th></tr></thead>
          <tbody>
            {classes.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td><td><strong>{c.name}</strong></td><td>{c.section || '—'}</td>
                <td><button className="btn btn-danger" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => del(c.id)}>Delete</button></td>
              </tr>
            ))}
            {classes.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No classes yet</td></tr>}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Class</h3>
            <div className="form-group"><label>Class Name</label><input className="input" placeholder="e.g. Class 10" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Section (optional)</label><input className="input" placeholder="e.g. A" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- TEACHERS ----
function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', subject: '' });

  const load = () => API.get('/api/admin/teachers').then(r => setTeachers(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    await API.post('/api/admin/teachers', form);
    setShowModal(false); setForm({ name: '', phone: '', password: '', subject: '' }); load();
  };

  const del = async (id) => {
    if (window.confirm('Delete this teacher?')) { await API.delete(`/api/admin/teachers/${id}`); load(); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>👨‍🏫 Teachers</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Teacher</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Subject</th><th>Action</th></tr></thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td><td><strong>{t.name}</strong></td><td>{t.phone}</td><td>{t.subject || '—'}</td>
                <td><button className="btn btn-danger" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => del(t.id)}>Delete</button></td>
              </tr>
            ))}
            {teachers.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No teachers yet</td></tr>}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Teacher</h3>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input className="input" placeholder="Teacher name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input className="input" placeholder="Phone no." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Subject</label><input className="input" placeholder="e.g. Maths" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              <div className="form-group"><label>Password</label><input className="input" type="password" placeholder="Set password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>Add Teacher</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- STUDENTS ----
function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', roll_no: '', parent_phone: '', parent_password: '', class_id: '' });

  const load = () => {
    API.get('/api/admin/students').then(r => setStudents(r.data));
    API.get('/api/admin/classes').then(r => setClasses(r.data));
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    await API.post('/api/admin/students', form);
    setShowModal(false); setForm({ name: '', roll_no: '', parent_phone: '', parent_password: '', class_id: '' }); load();
  };

  const del = async (id) => {
    if (window.confirm('Delete this student?')) { await API.delete(`/api/admin/students/${id}`); load(); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>👨‍🎓 Students</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Student</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Roll No</th><th>Class</th><th>Parent Phone</th><th>Action</th></tr></thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td><td><strong>{s.name}</strong></td><td>{s.roll_no}</td>
                <td><span className="badge badge-blue">{s.class_name || '—'}</span></td>
                <td>{s.parent_phone}</td>
                <td><button className="btn btn-danger" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => del(s.id)}>Delete</button></td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No students yet</td></tr>}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Student</h3>
            <div className="form-row">
              <div className="form-group"><label>Student Name</label><input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Roll No</label><input className="input" placeholder="Roll number" value={form.roll_no} onChange={e => setForm({ ...form, roll_no: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Parent Phone</label><input className="input" placeholder="Parent's phone" value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} /></div>
              <div className="form-group"><label>Parent Password</label><input className="input" type="password" placeholder="Set password" value={form.parent_password} onChange={e => setForm({ ...form, parent_password: e.target.value })} /></div>
            </div>
            <div className="form-group">
              <label>Class</label>
              <select className="input" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>Add Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }) {
  return (
    <Layout user={user} onLogout={onLogout} color="#7c3aed"
      navItems={[
        { key: 'overview', label: 'Overview', icon: '📊', component: Overview },
        { key: 'classes', label: 'Classes', icon: '🏛️', component: Classes },
        { key: 'teachers', label: 'Teachers', icon: '👨‍🏫', component: Teachers },
        { key: 'students', label: 'Students', icon: '👨‍🎓', component: Students },
      ]}
    />
  );
}
