import React from 'react';
import { Link } from 'react-router-dom';
import { useStudentPortal } from '../context/StudentPortalContext';
import {
  BookOpen, Calendar, CreditCard, UserCheck,
  ChevronRight, TrendingUp, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';

export default function StudentDashboard() {
  const { student } = useStudentPortal();

  if (!student) return null;

  const batch = student.intakeBatch;
  const course = batch?.course;

  // Finance summary
  const fees = student.studentFees || [];
  const totalBilled = fees.reduce((s, f) => s + f.netAmount, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalOutstanding = totalBilled - totalPaid;
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  // Attendance summary
  const lines = student.attendanceLines || [];
  const totalSessions = lines.length;
  const presentCount = lines.filter(l => l.status === 'PRESENT').length;
  const lateCount = lines.filter(l => l.status === 'LATE').length;
  const attendanceRate = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0;

  // Upcoming sessions (next 3)
  const sessions = batch?.sessions || [];
  const upcoming = sessions
    .filter(s => new Date(s.startDatetime) > new Date())
    .slice(0, 3);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(40,122,231,0.15), rgba(81,71,235,0.1))',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-bright-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            {dayName}, {dateStr}
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Welcome back, {student.name?.split(' ')[0]} 👋
          </h1>
          {course && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {course.title} · <span style={{ color: 'var(--text-main)' }}>{batch.name}</span>
            </p>
          )}
        </div>
        {course && (
          <div style={{
            padding: '0.85rem 1.25rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Course Code</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{course.code}</div>
          </div>
        )}
      </div>

      {/* KPI Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Sessions */}
        <Link to="/student/schedule" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', ':hover': { transform: 'translateY(-3px)' } }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>My Schedule</div>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color="#60a5fa" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{sessions.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Total class sessions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-bright-blue)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              View schedule <ChevronRight size={12} />
            </div>
          </div>
        </Link>

        {/* Finance */}
        <Link to="/student/billing" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: totalOutstanding > 0 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fees & Billing</div>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: totalOutstanding > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={18} color={totalOutstanding > 0 ? '#fbbf24' : '#34d399'} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: totalOutstanding > 0 ? '#fbbf24' : '#34d399' }}>
              ${totalOutstanding.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Outstanding balance</div>
            <div style={{ marginTop: '0.75rem', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${collectionRate}%`, background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{collectionRate}% paid</div>
          </div>
        </Link>

        {/* Attendance */}
        <Link to="/student/attendance" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: attendanceRate >= 75 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attendance Rate</div>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: attendanceRate >= 75 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={18} color={attendanceRate >= 75 ? '#34d399' : '#f87171'} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: attendanceRate >= 75 ? '#34d399' : '#f87171' }}>
              {totalSessions > 0 ? `${attendanceRate}%` : 'N/A'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {presentCount + lateCount} of {totalSessions} sessions attended
            </div>
            {attendanceRate > 0 && attendanceRate < 75 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>
                <AlertTriangle size={12} /> Below 75% threshold
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Upcoming Classes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--accent-bright-blue)" /> Upcoming Classes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 0.75rem', color: '#34d399', opacity: 0.7 }} />
                No upcoming sessions scheduled.
              </div>
            ) : upcoming.map(s => {
              const start = new Date(s.startDatetime);
              return (
                <div key={s.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{s.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {s.subject?.name} · {s.classroom?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-bright-blue)', fontWeight: 700 }}>
                      {start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <Clock size={11} />
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            {upcoming.length > 0 && (
              <Link to="/student/schedule" style={{ textDecoration: 'none' }}>
                <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  View full schedule <ChevronRight size={15} />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} color="#fbbf24" /> Recent Invoices
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {fees.slice(0, 3).map(fee => {
              const remaining = fee.netAmount - fee.paidAmount;
              const isPaid = fee.status === 'PAID';
              return (
                <div key={fee.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{fee.feeTerm.name}</div>
                    <span className={`status-badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>{isPaid ? 'Paid' : 'Pending'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Net: <strong style={{ color: 'white' }}>${fee.netAmount.toLocaleString()}</strong></span>
                    <span style={{ color: isPaid ? '#34d399' : '#f87171' }}>
                      {isPaid ? 'Fully Paid ✓' : `Due: $${remaining.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              );
            })}
            {fees.length === 0 && (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No invoices found.
              </div>
            )}
            {fees.length > 0 && (
              <Link to="/student/billing" style={{ textDecoration: 'none' }}>
                <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  View all invoices <ChevronRight size={15} />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
