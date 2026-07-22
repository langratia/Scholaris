import React, { useState } from 'react';
import Header from '../../../shared/components/Header';
import { createDepartment } from '../api/coreApi';

export default function DepartmentsPage({ departments, onDepartmentCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createDepartment(formData);
      setFormData({ name: '', code: '' });
      if (onDepartmentCreated) await onDepartmentCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Departments"
        subtitle="Manage institutional academic departments"
      />

      <div className="glass-panel">
        <h2 className="panel-title">Add New Department</h2>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Computer Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department Code</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. CS"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading} style={{ height: 'fit-content', padding: '0.8rem 1.75rem' }}>
            {loading ? 'Adding...' : 'Add Department'}
          </button>
        </form>
      </div>

      <div className="cards-grid">
        {departments.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">🏢</div>
            <h3>No Departments Defined</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>Add a department to get started.</p>
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="item-card">
              <div>
                <div className="card-top">
                  <h3 className="card-heading">{dept.name}</h3>
                  <span className="badge-tag">{dept.code}</span>
                </div>
                <div className="card-meta">
                  Faculty Count: {dept._count?.faculties || 0}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
