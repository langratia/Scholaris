import React, { useState, useEffect } from 'react';
import Header from '../../../shared/components/Header';
import { fetchRegisters, fetchApplications } from '../api/admissionsApi';
import { Users, FileText, CheckCircle2, AlertCircle, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdmissionsDashboard() {
  const [registers, setRegisters] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRegisters(), fetchApplications()])
      .then(([regs, apps]) => {
        setRegisters(regs);
        setApplications(apps);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getActiveRegisters = () => registers.filter(r => ['GATHERING', 'PROCESSING'].includes(r.status));
  const getPendingApps = () => applications.filter(a => ['SUBMITTED', 'PROCESSING'].includes(a.status));

  return (
    <div className="animate-fade-in">
      <Header />
      <div className="page-body">
        
        {/* Welcome Section */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title">Admissions Overview</h1>
            <p className="page-subtitle">Manage intake cycles and track incoming applications.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/admissions/registers" className="btn btn-secondary">Manage Intakes</Link>
            <Link to="/admissions/applications" className="btn btn-primary">Review Applications</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="card" style={{ flex: 1, height: '120px', opacity: 0.5 }} />)}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gradient-primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Intakes</div>
                  <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={22} color="#60a5fa" />
                  </div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{getActiveRegisters().length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Out of {registers.length} total registers
                </div>
              </div>

              <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Applications</div>
                  <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} color="#34d399" />
                  </div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{getPendingApps().length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Require review and decision
                </div>
              </div>

              <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Processed</div>
                  <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={22} color="#c084fc" />
                  </div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                  {applications.filter(a => ['DONE', 'REJECTED'].includes(a.status)).length}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Total applications resolved
                </div>
              </div>
            </div>

            {/* Active Intakes Snapshot */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Currently Active Intakes</h2>
            <div className="card" style={{ padding: 0 }}>
              {getActiveRegisters().length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                  <p>No active intake registers. Open a new register to accept applications.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Intake Name</th>
                      <th>Target Course</th>
                      <th>Applications</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getActiveRegisters().map(reg => (
                      <tr key={reg.id}>
                        <td><strong style={{ color: 'white' }}>{reg.name}</strong></td>
                        <td>{reg.targetCourse}</td>
                        <td><span style={{ color: 'var(--accent-bright-blue)', fontWeight: 700 }}>{reg._count?.applications || 0}</span> received</td>
                        <td>{reg.maxCapacity} slots</td>
                        <td><span className={`status-badge ${reg.status === 'GATHERING' ? 'badge-success' : 'badge-warning'}`}>{reg.status}</span></td>
                        <td>
                          <Link to="/admissions/applications" className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem' }}>
                            View <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
