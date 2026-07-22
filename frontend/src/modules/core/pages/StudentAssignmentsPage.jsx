import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Send, X, BookOpen } from 'lucide-react';
import { useStudentPortal } from '../context/StudentPortalContext';
import { assignmentsApi } from '../../assignments/api/assignmentsApi';

function SubmissionBadge({ status }) {
  const cfg = {
    PENDING:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  label: 'Pending' },
    SUBMITTED: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Submitted' },
    GRADED:    { color: '#34d399', bg: 'rgba(52,211,153,0.15)',  label: 'Graded' },
    LATE:      { color: '#fb923c', bg: 'rgba(251,146,60,0.15)',  label: 'Late' },
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

export default function StudentAssignmentsPage() {
  const { student } = useStudentPortal();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [submitModal, setSubmitModal] = useState(null); // assignment object
  const [submissionContent, setSubmissionContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submissions = student?.assignmentSubmissions || [];

  useEffect(() => {
    if (student?.intakeBatch?.id || student?.intakeBatchId) {
      const batchId = student.intakeBatch?.id || student.intakeBatchId;
      fetchAssignments(batchId);
    } else {
      setLoading(false);
    }
  }, [student]);

  const fetchAssignments = async (batchId) => {
    try {
      setLoading(true);
      const res = await assignmentsApi.getAll({ batchId, status: 'ACTIVE' });
      if (res.success) setAssignments(res.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSubmission = (assignmentId) =>
    submissions.find(s => s.assignmentId === assignmentId);

  const getStatus = (assignment) => {
    const sub = getSubmission(assignment.id);
    if (!sub) return 'PENDING';
    return sub.status;
  };

  const handleOpenSubmit = (assignment) => {
    const existing = getSubmission(assignment.id);
    setSubmissionContent(existing?.content || '');
    setFileUrl(existing?.fileUrl || '');
    setSubmitModal(assignment);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionContent.trim() && !fileUrl.trim()) {
      alert('Please provide either written content or a file URL.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await assignmentsApi.submit(submitModal.id, student.id, {
        content: submissionContent,
        fileUrl: fileUrl,
        studentId: student.id,
      });
      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitModal(null);
          // Reload page to get fresh profile with updated submissions
          window.location.reload();
        }, 1800);
      }
    } catch (err) {
      alert('Submission failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const pastSubmissions = submissions.filter(s =>
    s.status === 'GRADED' || new Date(s.assignment?.dueDate) < new Date()
  );

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Assignments
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          View your pending assignments and submit your work.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Active Assignments', value: assignments.length, color: '#fbbf24', gradient: 'linear-gradient(90deg,#f59e0b,#d97706)' },
          { label: 'Submitted', value: submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'LATE').length, color: '#60a5fa', gradient: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' },
          { label: 'Graded', value: submissions.filter(s => s.status === 'GRADED').length, color: '#34d399', gradient: 'linear-gradient(90deg,#10b981,#06b6d4)' },
          { label: 'Pending', value: assignments.filter(a => getStatus(a) === 'PENDING').length, color: '#f87171', gradient: 'linear-gradient(90deg,#ef4444,#dc2626)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.gradient }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Active Assignments */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Active Assignments</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <FileText size={44} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No active assignments</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Your instructors haven't posted any assignments yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {assignments.map(a => {
            const status = getStatus(a);
            const sub = getSubmission(a.id);
            const isPastDue = new Date() > new Date(a.dueDate);

            return (
              <div key={a.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <SubmissionBadge status={status} />
                  {isPastDue && status === 'PENDING' && (
                    <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>PAST DUE</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{a.title}</h3>
                <div style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.6rem' }}>
                  {a.subject?.name}
                </div>

                {a.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={12} style={{ color: 'var(--text-dim)' }} />
                    Due: <strong style={{ color: isPastDue ? '#f87171' : 'white' }}>{new Date(a.dueDate).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={12} style={{ color: 'var(--text-dim)' }} />
                    Max Marks: <strong style={{ color: 'white' }}>{a.maxMarks}</strong>
                    {sub?.marksObtained != null && (
                      <span style={{ color: '#34d399', fontWeight: 700 }}> · Scored: {sub.marksObtained}</span>
                    )}
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => handleOpenSubmit(a)}
                    className="btn-secondary"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      fontSize: '0.82rem', padding: '0.45rem 0',
                      background: status === 'GRADED' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                      color: status === 'GRADED' ? '#34d399' : '#fbbf24',
                      border: `1px solid ${status === 'GRADED' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
                    }}
                  >
                    {status === 'PENDING' ? <><Send size={14} /> Submit Work</> :
                     status === 'GRADED' ? <><CheckCircle2 size={14} /> View Grade</> :
                     <><Send size={14} /> Edit Submission</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past / Graded Submissions */}
      {pastSubmissions.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', marginTop: '1.5rem' }}>Past Submissions</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Assignment</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Submitted</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Marks</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {pastSubmissions.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: 'white' }}>{sub.assignment?.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub.assignment?.subject?.name}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <SubmissionBadge status={sub.status} />
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                        {sub.marksObtained != null
                          ? <span style={{ color: '#34d399' }}>{sub.marksObtained} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>/ {sub.assignment?.maxMarks}</span></span>
                          : <span style={{ color: 'var(--text-dim)' }}>Pending</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {sub.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SUBMIT MODAL */}
      {submitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setSubmitModal(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={52} style={{ color: '#34d399', margin: '0 auto 1rem' }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.4rem' }}>Submitted Successfully!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your assignment has been submitted. Good luck!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Submit Assignment</div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{submitModal.title}</h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Due: <span style={{ color: new Date() > new Date(submitModal.dueDate) ? '#f87171' : '#fbbf24', fontWeight: 600 }}>
                      {new Date(submitModal.dueDate).toLocaleString()}
                    </span>
                    {' '}· Max Marks: <span style={{ color: 'white', fontWeight: 600 }}>{submitModal.maxMarks}</span>
                  </div>
                  {submitModal.description && (
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {submitModal.description}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Written Answer
                  </label>
                  <textarea
                    placeholder="Type your answer here..."
                    value={submissionContent}
                    onChange={e => setSubmissionContent(e.target.value)}
                    rows={5}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    File / Document URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://docs.google.com/..."
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setSubmitModal(null)} className="btn-secondary">Cancel</button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
