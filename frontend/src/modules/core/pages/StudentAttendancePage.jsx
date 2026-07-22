import React, { useState } from 'react';
import { useStudentPortal } from '../context/StudentPortalContext';
import { UserCheck, AlertTriangle, Clock, CheckCircle2, XCircle, Search, TrendingUp } from 'lucide-react';

export default function StudentAttendancePage() {
  const { student } = useStudentPortal();
  const [search, setSearch] = useState('');

  const lines = student?.attendanceLines || [];

  const total = lines.length;
  const present = lines.filter(l => l.status === 'PRESENT').length;
  const late = lines.filter(l => l.status === 'LATE').length;
  const absent = total - present - late;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const filtered = lines.filter(l => {
    const q = search.toLowerCase();
    return (
      l.sheet?.course?.title?.toLowerCase().includes(q) ||
      l.sheet?.course?.code?.toLowerCase().includes(q) ||
      l.status?.toLowerCase().includes(q)
    );
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PRESENT': return { dot: '#34d399', label: 'Present', badge: 'badge-success' };
      case 'LATE': return { dot: '#fbbf24', label: 'Late', badge: 'badge-warning' };
      case 'ABSENT_EXCUSED': return { dot: '#60a5fa', label: 'Excused', badge: 'badge-info' };
      case 'ABSENT_UNEXCUSED':
      default: return { dot: '#f87171', label: 'Absent', badge: 'badge-danger' };
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Attendance</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Your session attendance records and overall presence rate.</p>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: rate >= 75 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Overall Rate</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: rate >= 75 ? '#34d399' : '#f87171', lineHeight: 1 }}>
            {total > 0 ? `${rate}%` : '—'}
          </div>
          {total > 0 && (
            <div style={{ marginTop: '0.75rem', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${rate}%`, background: rate >= 75 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : '#ef4444', borderRadius: '4px' }} />
            </div>
          )}
          {rate > 0 && rate < 75 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
              <AlertTriangle size={11} /> Below 75%
            </div>
          )}
        </div>

        {[
          { label: 'Present', count: present, icon: CheckCircle2, color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Late',    count: late,    icon: Clock,        color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Absent',  count: absent,  icon: XCircle,      color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
          { label: 'Total',   count: total,   icon: UserCheck,    color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '1.25rem', background: bg, border: `1px solid ${color}25` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{count}</div>
              </div>
              <Icon size={22} color={color} style={{ opacity: 0.7 }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              {total > 0 ? `${Math.round((count / total) * 100)}%` : '—'} of records
            </div>
          </div>
        ))}
      </div>

      {/* Records Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Session Records ({filtered.length})</h2>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem', width: '200px', height: '34px', fontSize: '0.83rem' }}
          />
        </div>
      </div>

      {total === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <UserCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No attendance records</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Attendance records will appear here once faculty submit session registers.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Registered By</th>
                <th>Status</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(line => {
                const sc = getStatusStyle(line.status);
                const date = line.sheet?.date ? new Date(line.sheet.date) : null;
                const faculty = line.sheet?.faculty;
                return (
                  <tr key={line.id} style={{ background: line.status !== 'PRESENT' && line.status !== 'LATE' ? 'rgba(239,68,68,0.03)' : undefined }}>
                    <td>
                      {date ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'white', fontSize: '0.88rem' }}>
                            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {date.toLocaleDateString('en-US', { year: 'numeric' })}
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'white', fontSize: '0.88rem' }}>{line.sheet?.course?.title || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{line.sheet?.course?.code}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {faculty ? `${faculty.firstName} ${faculty.lastName}` : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                        <span className={`status-badge ${sc.badge}`}>{sc.label}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.83rem' }}>{line.remark || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
