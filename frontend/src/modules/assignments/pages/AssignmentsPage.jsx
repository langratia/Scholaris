import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Eye, X, Check, Search, Clock, Users, BookOpen, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import { assignmentsApi } from '../api/assignmentsApi';
import { fetchCourses, fetchBatches, fetchSubjects, fetchFaculty } from '../../core/api/coreApi';

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  fontSize: '0.88rem',
  boxSizing: 'border-box',
};

const selectStyle = {
  ...{
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#1e293b',
    color: 'white',
    fontSize: '0.88rem',
    boxSizing: 'border-box',
  }
};

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: '0.35rem',
};

function StatusBadge({ status }) {
  const cfg = {
    ACTIVE: { color: '#34d399', bg: 'rgba(52,211,153,0.15)', label: 'Active' },
    CLOSED: { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: 'Closed' },
  }[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: status };
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
      fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`
    }}>
      {cfg.label}
    </span>
  );
}

function SubmissionStatusBadge({ status }) {
  const cfg = {
    SUBMITTED: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', label: 'Submitted' },
    GRADED: { color: '#34d399', bg: 'rgba(52,211,153,0.15)', label: 'Graded' },
    LATE: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Late' },
  }[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: status };
  return (
    <span style={{
      padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem',
      fontWeight: 700, color: cfg.color, background: cfg.bg
    }}>
      {cfg.label}
    </span>
  );
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Reference data
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: '100',
    courseId: '',
    batchId: '',
    subjectId: '',
    facultyId: '',
  });

  // View/grade modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [gradingState, setGradingState] = useState({});
  const [gradingSaving, setGradingSaving] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [asgn, crs, btch, subj, fac] = await Promise.all([
        assignmentsApi.getAll(),
        fetchCourses(),
        fetchBatches(),
        fetchSubjects(),
        fetchFaculty(),
      ]);
      if (asgn.success) setAssignments(asgn.data);
      setCourses(crs);
      setBatches(btch);
      setSubjects(subj);
      setFaculties(fac);
    } catch (err) {
      console.error('Failed to load assignments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const payload = {
        ...formData,
        courseId: Number(formData.courseId),
        batchId: Number(formData.batchId),
        subjectId: Number(formData.subjectId),
        facultyId: Number(formData.facultyId),
        maxMarks: Number(formData.maxMarks),
      };
      const res = await assignmentsApi.create(payload);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({ title: '', description: '', dueDate: '', maxMarks: '100', courseId: '', batchId: '', subjectId: '', facultyId: '' });
        loadAll();
      }
    } catch (err) {
      alert('Error creating assignment: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleView = async (assignment) => {
    try {
      setLoadingDetail(true);
      setSelectedAssignment(null);
      const res = await assignmentsApi.getById(assignment.id);
      if (res.success) {
        setSelectedAssignment(res.data);
        const init = {};
        (res.data.submissions || []).forEach(s => { init[s.id] = { marks: s.marksObtained ?? '', remarks: s.remarks || '' }; });
        setGradingState(init);
        setGradeSuccess(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleGrade = async (submissionId) => {
    try {
      setGradingSaving(true);
      const { marks, remarks } = gradingState[submissionId] || {};
      await assignmentsApi.grade(submissionId, { marksObtained: Number(marks), remarks });
      setGradeSuccess(submissionId);
      setTimeout(() => setGradeSuccess(null), 2500);
      // Refresh detail
      const res = await assignmentsApi.getById(selectedAssignment.id);
      if (res.success) setSelectedAssignment(res.data);
    } catch (err) {
      alert('Grading failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setGradingSaving(false);
    }
  };

  const filtered = assignments.filter(a => {
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term ||
      a.title.toLowerCase().includes(term) ||
      a.subject?.name.toLowerCase().includes(term) ||
      a.course?.code.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Page Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.07) 100%)',
        border: '1px solid rgba(251,191,36,0.22)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Academic Management
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Assignment Posts
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Create assignments for student batches, review submissions, and publish grades.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none' }}
        >
          <Plus size={16} /> Create Assignment
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Assignments', value: assignments.length, color: '#f59e0b', gradient: 'linear-gradient(90deg,#f59e0b,#d97706)' },
          { label: 'Active', value: assignments.filter(a => a.status === 'ACTIVE').length, color: '#34d399', gradient: 'linear-gradient(90deg,#10b981,#06b6d4)' },
          { label: 'Total Submissions', value: assignments.reduce((acc, a) => acc + (a._count?.submissions || 0), 0), color: '#60a5fa', gradient: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' },
          { label: 'Closed', value: assignments.filter(a => a.status === 'CLOSED').length, color: '#94a3b8', gradient: 'linear-gradient(90deg,#64748b,#475569)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: stat.gradient }} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{stat.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'ACTIVE', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: filterStatus === st ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                background: filterStatus === st ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.03)',
                color: filterStatus === st ? '#fbbf24' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search assignment, subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {/* Assignment Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No assignments found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Create an assignment or adjust your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(a => (
            <div key={a.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <StatusBadge status={a.status} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {a._count?.submissions || 0} submission{a._count?.submissions !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{a.title}</h3>
                <div style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {a.subject?.name} · {a.course?.code}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} style={{ color: 'var(--text-dim)' }} />
                    Due: {new Date(a.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={13} style={{ color: 'var(--text-dim)' }} />
                    Batch: <strong style={{ color: 'white' }}>{a.batch?.name}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={13} style={{ color: 'var(--text-dim)' }} />
                    Max Marks: <strong style={{ color: 'white' }}>{a.maxMarks}</strong>
                  </div>
                </div>
              </div>
              <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => handleView(a)}
                  className="btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0', background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  <Eye size={14} /> View Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Create Assignment</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Post a new assignment to a course batch.</p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Assignment Title</label>
                <input type="text" required placeholder="e.g. Research Paper: Market Analysis" value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description / Instructions</label>
                <textarea required placeholder="Detailed instructions for students..." value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Due Date & Time</label>
                  <input type="datetime-local" required value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }} />
                </div>
                <div>
                  <label style={labelStyle}>Max Marks</label>
                  <input type="number" required min="1" value={formData.maxMarks}
                    onChange={e => setFormData({ ...formData, maxMarks: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Course</label>
                  <select required value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })} style={selectStyle}>
                    <option value="">Select Course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Batch</label>
                  <select required value={formData.batchId} onChange={e => setFormData({ ...formData, batchId: e.target.value })} style={selectStyle}>
                    <option value="">Select Batch...</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <select required value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} style={selectStyle}>
                    <option value="">Select Subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Faculty</label>
                  <select required value={formData.facultyId} onChange={e => setFormData({ ...formData, facultyId: e.target.value })} style={selectStyle}>
                    <option value="">Select Faculty...</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={15} /> {creating ? 'Creating...' : 'Post Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & GRADE MODAL */}
      {(loadingDetail || selectedAssignment) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1.5rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => { setSelectedAssignment(null); setLoadingDetail(false); }} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            {loadingDetail && !selectedAssignment ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading details...</div>
            ) : selectedAssignment && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                    Assignment · Submissions
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem' }}>{selectedAssignment.title}</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Subject: <span style={{ color: 'white', fontWeight: 600 }}>{selectedAssignment.subject?.name}</span>
                    {' '}| Batch: <span style={{ color: 'white', fontWeight: 600 }}>{selectedAssignment.batch?.name}</span>
                    {' '}| Due: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{new Date(selectedAssignment.dueDate).toLocaleString()}</span>
                    {' '}| Max: <span style={{ color: '#34d399', fontWeight: 700 }}>{selectedAssignment.maxMarks}</span>
                  </div>
                  {selectedAssignment.description && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {selectedAssignment.description}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '1.25rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Student</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Submitted At</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Content / File</th>
                        <th style={{ padding: '0.75rem 1rem', width: '130px' }}>Marks</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Remarks</th>
                        <th style={{ padding: '0.75rem 1rem', width: '90px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedAssignment.submissions || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <AlertCircle size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                            <div>No submissions yet.</div>
                          </td>
                        </tr>
                      ) : (
                        selectedAssignment.submissions.map(sub => (
                          <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontWeight: 600, color: 'white' }}>{sub.student.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub.student.email}</div>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {new Date(sub.submittedAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <SubmissionStatusBadge status={sub.status} />
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                              {sub.fileUrl
                                ? <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>View File</a>
                                : <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sub.content || '—'}</span>
                              }
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <input
                                type="number"
                                min="0"
                                max={selectedAssignment.maxMarks}
                                placeholder="0"
                                value={gradingState[sub.id]?.marks ?? ''}
                                onChange={e => setGradingState(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], marks: e.target.value } }))}
                                style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}
                              />
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginLeft: '0.3rem' }}>/{selectedAssignment.maxMarks}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <input
                                type="text"
                                placeholder="Optional..."
                                value={gradingState[sub.id]?.remarks ?? ''}
                                onChange={e => setGradingState(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], remarks: e.target.value } }))}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '0.78rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              {gradeSuccess === sub.id ? (
                                <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}><CheckCircle2 size={14} /> Saved</span>
                              ) : (
                                <button
                                  onClick={() => handleGrade(sub.id)}
                                  disabled={gradingSaving}
                                  style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.1)', color: '#34d399', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <Check size={13} /> Grade
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedAssignment(null)} className="btn-secondary">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
