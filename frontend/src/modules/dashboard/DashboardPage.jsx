import React from 'react';
import Header from '../../shared/components/Header';

export default function DashboardPage({ studentsCount, coursesCount, departmentsCount, facultyCount }) {
  return (
    <div className="animate-fade-in">
      <Header
        title="Institutional Dashboard"
        subtitle="System overview and quick metrics for Scholaris Suite"
      />

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Enrolled Students</span>
            <div className="metric-icon icon-blue">👥</div>
          </div>
          <div className="metric-value">{studentsCount}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Courses</span>
            <div className="metric-icon icon-purple">📚</div>
          </div>
          <div className="metric-value">{coursesCount}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Departments</span>
            <div className="metric-icon icon-emerald">🏢</div>
          </div>
          <div className="metric-value">{departmentsCount}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Faculty Staff</span>
            <div className="metric-icon icon-blue">👨‍🏫</div>
          </div>
          <div className="metric-value">{facultyCount}</div>
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="panel-title">⚡ Platform Architecture Status</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: 'var(--glass-border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Architecture Mode</span>
            <div style={{ fontWeight: '600', marginTop: '0.2rem', color: '#60a5fa' }}>Domain-Driven Feature Modules</div>
          </div>
          <div style={{ padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: 'var(--glass-border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Backend Stack</span>
            <div style={{ fontWeight: '600', marginTop: '0.2rem', color: '#c084fc' }}>Node / Express + Prisma ORM</div>
          </div>
          <div style={{ padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: 'var(--glass-border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Database Persistence</span>
            <div style={{ fontWeight: '600', marginTop: '0.2rem', color: '#34d399' }}>SQLite (dev.db)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
