import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  ChevronRight,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  ArrowRight,
  X,
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import {
  fetchRegisters,
  createRegister,
  fetchApplications,
  createApplication,
  updateApplicationStatus,
} from '../api/admissionsApi';

const STATUS_CONFIG = {
  DRAFT:            { label: 'Draft',            color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  SUBMITTED:        { label: 'Submitted',         color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  CONFIRMED:        { label: 'Confirmed',         color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  ADMISSION_CONFIRM:{ label: 'Offer Sent',        color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  DONE:             { label: 'Enrolled',          color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  REJECTED:         { label: 'Rejected',          color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  CANCELLED:        { label: 'Cancelled',         color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
};

const NEXT_STATUS = {
  DRAFT:            'SUBMITTED',
  SUBMITTED:        'CONFIRMED',
  CONFIRMED:        'ADMISSION_CONFIRM',
  ADMISSION_CONFIRM:'DONE',
};

const NEXT_LABEL = {
  DRAFT:            'Submit Application',
  SUBMITTED:        'Confirm Review',
  CONFIRMED:        'Send Admission Offer',
  ADMISSION_CONFIRM:'Enrol as Student',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span style={{
      padding: '0.3rem 0.8rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      letterSpacing: '0.03em',
    }}>
      {cfg.label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(13,19,33,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdmissionsPage() {
  const [registers, setRegisters] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);

  const [regForm, setRegForm] = useState({
    name: '', startDate: '', endDate: '', minCapacity: 0, maxCapacity: '', targetCourse: '',
  });
  const [appForm, setAppForm] = useState({
    firstName: '', middleName: '', lastName: '',
    birthDate: '', email: '', phone: '',
    targetCourse: '', previousInstitution: '', previousCourse: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [regs, apps] = await Promise.all([fetchRegisters(), fetchApplications()]);
      setRegisters(regs);
      setApplications(apps);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRegister({
        ...regForm,
        minCapacity: parseInt(regForm.minCapacity) || 0,
        maxCapacity: parseInt(regForm.maxCapacity),
        startDate: new Date(regForm.startDate).toISOString(),
        endDate: new Date(regForm.endDate).toISOString(),
      });
      setShowRegisterModal(false);
      setRegForm({ name: '', startDate: '', endDate: '', minCapacity: 0, maxCapacity: '', targetCourse: '' });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!selectedRegister) { setError('Please select a campaign first'); return; }
    setSubmitting(true);
    try {
      await createApplication({
        ...appForm,
        birthDate: new Date(appForm.birthDate).toISOString(),
        registerId: selectedRegister.id,
      });
      setShowAppModal(false);
      setAppForm({ firstName: '', middleName: '', lastName: '', birthDate: '', email: '', phone: '', targetCourse: '', previousInstitution: '', previousCourse: '' });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (app) => {
    const next = NEXT_STATUS[app.status];
    if (!next) return;
    try {
      await updateApplicationStatus(app.id, next);
      if (next === 'DONE') {
        alert(`✅ ${app.firstName} ${app.lastName} has been enrolled as a Student!`);
      }
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleReject = async (app) => {
    try {
      await updateApplicationStatus(app.id, 'REJECTED');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const filteredApps = selectedRegister
    ? applications.filter((a) => a.registerId === selectedRegister.id)
    : applications;

  if (loading) return (
    <div className="animate-fade-in">
      <Header title="Admissions" subtitle="Loading..." />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Header
        title="Admissions Registry"
        subtitle="Manage campaigns, applications and enrolment workflows"
      />

      {error && (
        <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Campaigns Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Admission Campaigns
        </h2>
        <button className="btn-submit" onClick={() => setShowRegisterModal(true)}>
          <Plus size={16} /> New Campaign
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {registers.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <ClipboardList size={40} style={{ opacity: 0.4, marginBottom: '1rem', color: 'var(--primary)' }} />
            <h3>No Campaigns Yet</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>Create an admission campaign to start accepting applications.</p>
          </div>
        ) : (
          registers.map((reg) => (
            <div
              key={reg.id}
              className="item-card"
              onClick={() => setSelectedRegister(selectedRegister?.id === reg.id ? null : reg)}
              style={{
                cursor: 'pointer',
                border: selectedRegister?.id === reg.id
                  ? '1px solid rgba(59,130,246,0.5)'
                  : 'var(--glass-border)',
                background: selectedRegister?.id === reg.id
                  ? 'rgba(59,130,246,0.07)'
                  : 'var(--surface-glass)',
              }}
            >
              <div className="card-top">
                <h3 className="card-heading">{reg.name}</h3>
                <StatusBadge status={reg.status} />
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem' }}>
                <div className="card-meta">
                  <Users size={14} /> {reg._count?.applications ?? 0} apps
                </div>
                <div className="card-meta">
                  <Calendar size={14} /> {new Date(reg.startDate).toLocaleDateString()}
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                {reg.targetCourse} · Max {reg.maxCapacity} seats
              </div>
            </div>
          ))
        )}
      </div>

      {/* Applications Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {selectedRegister ? `Applications — ${selectedRegister.name}` : 'All Applications'}
        </h2>
        <button
          className="btn-submit"
          onClick={() => { if (!selectedRegister) { setError('Select a campaign first to add an application'); return; } setShowAppModal(true); }}
          style={{ background: 'linear-gradient(135deg,#4527D7,#5147EB)' }}
        >
          <Plus size={16} /> New Application
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <Send size={40} style={{ opacity: 0.4, marginBottom: '1rem', color: '#a78bfa' }} />
            <h3>No Applications Yet</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>Select a campaign above then click "New Application".</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div key={app.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                    {app.firstName} {app.middleName} {app.lastName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {app.email} · {app.targetCourse}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    {app.applicationNumber} · {app.register?.name ?? '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={app.status} />
                  {NEXT_STATUS[app.status] && (
                    <button
                      onClick={() => handleAdvanceStatus(app)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))',
                        color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      }}
                    >
                      {NEXT_LABEL[app.status]} <ArrowRight size={14} />
                    </button>
                  )}
                  {!['REJECTED','CANCELLED','DONE'].includes(app.status) && (
                    <button
                      onClick={() => handleReject(app)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 0.85rem', borderRadius: '10px',
                        background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                        color: '#f87171', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Register Modal */}
      {showRegisterModal && (
        <Modal title="New Admission Campaign" onClose={() => setShowRegisterModal(false)}>
          <form onSubmit={handleCreateRegister}>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Campaign Name</label>
                <input className="form-input" required placeholder="e.g. Fall 2026 Admissions"
                  value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="datetime-local" required
                  value={regForm.startDate} onChange={(e) => setRegForm({ ...regForm, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="datetime-local" required
                  value={regForm.endDate} onChange={(e) => setRegForm({ ...regForm, endDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Capacity</label>
                <input className="form-input" type="number" min="0" placeholder="0"
                  value={regForm.minCapacity} onChange={(e) => setRegForm({ ...regForm, minCapacity: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Capacity</label>
                <input className="form-input" type="number" min="1" required placeholder="50"
                  value={regForm.maxCapacity} onChange={(e) => setRegForm({ ...regForm, maxCapacity: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Target Course / Programme</label>
                <input className="form-input" required placeholder="e.g. Bachelor of Science"
                  value={regForm.targetCourse} onChange={(e) => setRegForm({ ...regForm, targetCourse: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </form>
        </Modal>
      )}

      {/* Create Application Modal */}
      {showAppModal && (
        <Modal title={`New Application — ${selectedRegister?.name}`} onClose={() => setShowAppModal(false)}>
          <form onSubmit={handleCreateApplication}>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" required placeholder="James"
                  value={appForm.firstName} onChange={(e) => setAppForm({ ...appForm, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input className="form-input" placeholder="Optional"
                  value={appForm.middleName} onChange={(e) => setAppForm({ ...appForm, middleName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" required placeholder="Mwangi"
                  value={appForm.lastName} onChange={(e) => setAppForm({ ...appForm, lastName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" required
                  value={appForm.birthDate} onChange={(e) => setAppForm({ ...appForm, birthDate: e.target.value + 'T00:00:00.000Z' })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" required placeholder="james@email.com"
                  value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" required placeholder="+254 700 000 000"
                  value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Target Course</label>
                <input className="form-input" required
                  placeholder={selectedRegister?.targetCourse || 'Course name'}
                  value={appForm.targetCourse || selectedRegister?.targetCourse}
                  onChange={(e) => setAppForm({ ...appForm, targetCourse: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Previous Institution</label>
                <input className="form-input" placeholder="e.g. Nairobi High"
                  value={appForm.previousInstitution} onChange={(e) => setAppForm({ ...appForm, previousInstitution: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Previous Course / Grade</label>
                <input className="form-input" placeholder="e.g. KCSE A-"
                  value={appForm.previousCourse} onChange={(e) => setAppForm({ ...appForm, previousCourse: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={submitting} style={{ width: '100%', background: 'linear-gradient(135deg,#4527D7,#5147EB)' }}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
