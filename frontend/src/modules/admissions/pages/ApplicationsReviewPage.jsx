import React, { useState, useEffect } from 'react';
import Header from '../../../shared/components/Header';
import { fetchApplications, updateApplicationStatus, fetchRegisters } from '../api/admissionsApi';
import { Search, Filter, CheckCircle2, XCircle, Clock, User, Mail, Phone, GraduationCap } from 'lucide-react';

export default function ApplicationsReviewPage() {
  const [applications, setApplications] = useState([]);
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterReg, setFilterReg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchApplications(), fetchRegisters()]).then(([apps, regs]) => {
      setApplications(apps);
      setRegisters(regs);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const changeStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this application to ${newStatus}?`)) return;
    try {
      await updateApplicationStatus(id, newStatus);
      loadData();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredApps = applications.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchSearch = a.firstName.toLowerCase().includes(q) || a.lastName.toLowerCase().includes(q) || a.applicationNumber.toLowerCase().includes(q);
    const matchReg = filterReg ? a.registerId.toString() === filterReg : true;
    return matchSearch && matchReg;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'badge-info';
      case 'PROCESSING': return 'badge-warning';
      case 'ADMISSION_CONFIRM':
      case 'DONE': return 'badge-success';
      case 'REJECTED':
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="animate-fade-in">
      <Header />
      <div className="page-body">
        
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Application Review</h1>
            <p className="page-subtitle">Review incoming applications and make admission decisions.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <select className="form-input" style={{ paddingLeft: '2.5rem', minWidth: '200px' }} value={filterReg} onChange={e => setFilterReg(e.target.value)}>
                <option value="">All Intake Registers</option>
                {registers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input type="text" className="form-input" placeholder="Search applicant..." style={{ paddingLeft: '2.5rem', width: '250px' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 400px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>Loading applications...</div>
            ) : filteredApps.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found matching your criteria.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>App Number</th>
                    <th>Applicant Name</th>
                    <th>Register & Course</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map(app => (
                    <tr key={app.id} onClick={() => setSelectedApp(app)} style={{ cursor: 'pointer', background: selectedApp?.id === app.id ? 'rgba(59,130,246,0.08)' : undefined }}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-bright-blue)' }}>{app.applicationNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'white' }}>{app.lastName}, {app.firstName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{app.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{app.register?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{app.targetCourse}</div>
                      </td>
                      <td><span className={`status-badge ${getStatusBadgeClass(app.status)}`}>{app.status}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selectedApp && (
            <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Review</div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{selectedApp.firstName} {selectedApp.lastName}</h2>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-bright-blue)', marginTop: '0.2rem' }}>{selectedApp.applicationNumber}</div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="btn btn-ghost" style={{ padding: '0.3rem' }}>×</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Status:</span>
                <span className={`status-badge ${getStatusBadgeClass(selectedApp.status)}`}>{selectedApp.status}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Mail size={16} color="var(--text-dim)" style={{ marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Email Address</div>
                    <div style={{ fontSize: '0.9rem' }}>{selectedApp.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Phone size={16} color="var(--text-dim)" style={{ marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Phone Number</div>
                    <div style={{ fontSize: '0.9rem' }}>{selectedApp.phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <User size={16} color="var(--text-dim)" style={{ marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Date of Birth</div>
                    <div style={{ fontSize: '0.9rem' }}>{new Date(selectedApp.birthDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <GraduationCap size={16} color="var(--text-dim)" style={{ marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Previous Education</div>
                    <div style={{ fontSize: '0.9rem' }}>{selectedApp.previousInstitution || 'Not provided'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{selectedApp.previousCourse}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem' }}>Review Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedApp.status === 'SUBMITTED' && (
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => changeStatus(selectedApp.id, 'PROCESSING')}>
                      <Clock size={16} /> Mark as Processing
                    </button>
                  )}
                  {['SUBMITTED', 'PROCESSING'].includes(selectedApp.status) && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn" style={{ flex: 1, justifyContent: 'center', background: 'rgba(16,185,129,0.15)', color: '#34d399' }} onClick={() => changeStatus(selectedApp.id, 'ADMISSION_CONFIRM')}>
                        <CheckCircle2 size={16} /> Approve & Admit
                      </button>
                      <button className="btn" style={{ flex: 1, justifyContent: 'center', background: 'rgba(239,68,68,0.15)', color: '#f87171' }} onClick={() => changeStatus(selectedApp.id, 'REJECTED')}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                  {selectedApp.status === 'ADMISSION_CONFIRM' && (
                    <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                      <CheckCircle2 size={24} color="#34d399" style={{ margin: '0 auto 0.5rem auto' }} />
                      <div style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600 }}>Admitted & Student Record Created!</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        You can now mark this application as fully resolved.
                      </div>
                      <button className="btn btn-ghost" style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }} onClick={() => changeStatus(selectedApp.id, 'DONE')}>
                        Mark as Done
                      </button>
                    </div>
                  )}
                  {['DONE', 'REJECTED', 'CANCELLED'].includes(selectedApp.status) && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      This application has been resolved and no further actions can be taken.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
