import React, { useState } from 'react';
import Header from '../../../shared/components/Header';
import { createCourse } from '../api/coreApi';

export default function CoursesPage({ courses, onCourseCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ title: '', code: '', instructor: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createCourse(formData);
      setFormData({ title: '', code: '', instructor: '' });
      if (onCourseCreated) await onCourseCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Course Catalog"
        subtitle="Manage academic courses and assigned instructors"
      />

      <div className="glass-panel">
        <h2 className="panel-title">Create New Course</h2>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Organic Chemistry"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Code</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. CHEM-202"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructor</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Dr. Robert Vance"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ height: 'fit-content' }}>
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>

      <div className="cards-grid">
        {courses.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">📚</div>
            <h3>No Courses Created Yet</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>Use the form above to add your first course.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="item-card">
              <div>
                <div className="card-top">
                  <h3 className="card-heading">{course.title}</h3>
                  <span className="badge-tag">{course.code}</span>
                </div>
                <div className="card-meta">
                  👨‍🏫 Instructor: {course.instructor}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
