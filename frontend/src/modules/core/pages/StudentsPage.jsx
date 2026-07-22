import React, { useState } from 'react';
import Header from '../../../shared/components/Header';
import { createStudent } from '../api/coreApi';

export default function StudentsPage({ students, onStudentCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', grade: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createStudent(formData);
      setFormData({ name: '', email: '', grade: '' });
      if (onStudentCreated) await onStudentCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Student Registry"
        subtitle="Manage student admissions and academic profiles"
      />

      <div className="glass-panel">
        <h2 className="panel-title">Admit New Student</h2>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Sophia Martinez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="sophia@scholaris.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Grade / Year</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Grade 11"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ height: 'fit-content' }}>
            {loading ? 'Admitting...' : 'Admit Student'}
          </button>
        </form>
      </div>

      <div className="cards-grid">
        {students.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">👥</div>
            <h3>No Students Admitted Yet</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>Use the form above to add your first student.</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="item-card">
              <div>
                <div className="card-top">
                  <h3 className="card-heading">{student.name}</h3>
                  <span className="badge-tag">{student.grade}</span>
                </div>
                <div className="card-meta">
                  📧 {student.email}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
