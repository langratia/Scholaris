import React, { useState } from 'react';
import { GraduationCap, Mail } from 'lucide-react';
import Header from '../../../shared/components/Header';
import { createFaculty } from '../api/coreApi';

export default function FacultyPage({ faculty, departments, onFacultyCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', departmentId: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createFaculty(formData);
      setFormData({ firstName: '', lastName: '', email: '', departmentId: '' });
      if (onFacultyCreated) await onFacultyCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Faculty Directory"
        subtitle="Manage teaching staff and department assignments"
      />

      <div className="glass-panel">
        <h2 className="panel-title">Register Faculty Member</h2>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              required
              className="form-input"
              style={{ appearance: 'none', backgroundColor: 'rgba(8, 12, 22, 0.6)' }}
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-submit" disabled={loading} style={{ height: 'fit-content', padding: '0.8rem 1.75rem' }}>
            {loading ? 'Registering...' : 'Add Faculty'}
          </button>
        </form>
      </div>

      <div className="cards-grid">
        {faculty.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <GraduationCap size={44} style={{ opacity: 0.35, marginBottom: '1rem', color: 'var(--primary)' }} />
            <h3>No Faculty Registered</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>Register a new faculty member to see them listed.</p>
          </div>
        ) : (
          faculty.map((member) => (
            <div key={member.id} className="item-card">
              <div>
                <div className="card-top">
                  <h3 className="card-heading">{member.lastName}, {member.firstName}</h3>
                </div>
                <div className="card-meta">
                  <span className="badge-tag" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                    {member.department?.name || 'Unassigned'}
                  </span>
                </div>
                <div className="card-meta" style={{ marginTop: '0.75rem' }}>
                  <Mail size={13} /> {member.email}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
