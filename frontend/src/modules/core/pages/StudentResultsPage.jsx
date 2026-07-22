import React from 'react';
import { useStudentPortal } from '../context/StudentPortalContext';
import { Award, BookOpen, CheckCircle2, XCircle, TrendingUp, FileText, AlertCircle } from 'lucide-react';

function getGradeBadge(grade) {
  const styles = {
    'A+': { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
    'A': { color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    'B': { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    'C': { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    'D': { color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
    'F': { color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  };
  const cfg = styles[grade] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
  return (
    <span style={{
      padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem',
      fontWeight: 800, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`
    }}>
      {grade || 'N/A'}
    </span>
  );
}

export default function StudentResultsPage() {
  const { student } = useStudentPortal();
  const results = student?.examResults || [];

  const totalExams = results.length;
  
  let totalScoreSum = 0;
  let totalMaxSum = 0;
  let passedCount = 0;

  results.forEach((res) => {
    const exam = res.examSchedule;
    const maxM = exam?.maxMarks || 100;
    const passM = exam?.passMarks || 40;
    totalScoreSum += res.marksObtained;
    totalMaxSum += maxM;
    if (res.marksObtained >= passM) passedCount++;
  });

  const overallPercentage = totalMaxSum > 0 ? Math.round((totalScoreSum / totalMaxSum) * 100) : 0;
  const passRate = totalExams > 0 ? Math.round((passedCount / totalExams) * 100) : 0;

  // Grade points mapping for GPA estimation
  const getGpaPoints = (pct) => {
    if (pct >= 90) return 4.0;
    if (pct >= 80) return 3.7;
    if (pct >= 70) return 3.0;
    if (pct >= 60) return 2.0;
    if (pct >= 50) return 1.0;
    return 0.0;
  };
  const estGpa = (getGpaPoints(overallPercentage)).toFixed(2);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Academic Results & Transcript</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Your examination scores, grades, and academic performance overview.</p>
      </div>

      {/* Summary Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#8b5cf6,#6366f1)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Estimated GPA</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc' }}>{estGpa} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 4.0</span></div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Average: {overallPercentage}%</div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#10b981,#06b6d4)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Exams Completed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>{totalExams}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Across all courses</div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Pass Rate</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>{passRate}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{passedCount} of {totalExams} passed</div>
        </div>
      </div>

      {/* Transcript Table */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Official Marks Breakdown</h2>

      {results.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <Award size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No examination results yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your graded exam results will appear here once published by faculty.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Subject & Course</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Exam Title</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Type</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Marks</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Percentage</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Grade</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => {
                  const exam = res.examSchedule;
                  const maxM = exam?.maxMarks || 100;
                  const passM = exam?.passMarks || 40;
                  const pct = Math.round((res.marksObtained / maxM) * 100);
                  const isPassed = res.marksObtained >= passM;

                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'white' }}>{exam?.subject?.name || 'Subject'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{exam?.course?.title} ({exam?.course?.code})</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{exam?.title}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>{exam?.type}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                        {exam?.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'white' }}>
                        {res.marksObtained} <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 400 }}>/ {maxM}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: isPassed ? '#34d399' : '#f87171' }}>
                        {pct}%
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {getGradeBadge(res.grade)}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={`status-badge ${isPassed ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {isPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isPassed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
