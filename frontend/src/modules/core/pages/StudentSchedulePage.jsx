import React, { useState } from 'react';
import { useStudentPortal } from '../context/StudentPortalContext';
import { Calendar, Clock, MapPin, User, BookOpen, Filter, Search } from 'lucide-react';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_COLORS = {
  Monday:    { bg: 'rgba(59,130,246,0.12)', accent: '#60a5fa' },
  Tuesday:   { bg: 'rgba(139,92,246,0.12)', accent: '#c084fc' },
  Wednesday: { bg: 'rgba(16,185,129,0.12)', accent: '#34d399' },
  Thursday:  { bg: 'rgba(245,158,11,0.12)', accent: '#fbbf24' },
  Friday:    { bg: 'rgba(236,72,153,0.12)', accent: '#f472b6' },
  Saturday:  { bg: 'rgba(6,182,212,0.12)',  accent: '#22d3ee' },
  Sunday:    { bg: 'rgba(99,102,241,0.12)', accent: '#818cf8' },
};

export default function StudentSchedulePage() {
  const { student } = useStudentPortal();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grouped'); // 'grouped' | 'list'

  const sessions = student?.intakeBatch?.sessions || [];

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.subject?.name?.toLowerCase().includes(q) ||
      s.faculty?.firstName?.toLowerCase().includes(q) ||
      s.faculty?.lastName?.toLowerCase().includes(q) ||
      s.classroom?.name?.toLowerCase().includes(q)
    );
  });

  // Group by day of week
  const grouped = {};
  filtered.forEach(s => {
    const day = new Date(s.startDatetime).toLocaleDateString('en-US', { weekday: 'long' });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(s);
  });

  const orderedDays = DAY_ORDER.filter(d => grouped[d]);

  const formatTime = (dt) => new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dt) => new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Schedule</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {student?.intakeBatch?.name} · {sessions.length} total sessions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search sessions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem', width: '220px', height: '36px', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            {['grouped', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '0.4rem 0.85rem', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
                background: view === v ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: view === v ? 'white' : 'var(--text-dim)',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No sessions scheduled</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your batch timetable hasn't been set up yet. Check back later.</p>
        </div>
      ) : view === 'grouped' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orderedDays.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sessions match your search.</div>
          ) : orderedDays.map(day => {
            const { bg, accent } = DAY_COLORS[day] || { bg: 'rgba(255,255,255,0.04)', accent: '#94a3b8' };
            return (
              <div key={day}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: accent }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: accent }}>{day}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.5rem', borderRadius: '6px' }}>
                    {grouped[day].length} session{grouped[day].length > 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {grouped[day].sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime)).map(s => (
                    <SessionCard key={s.id} session={s} accent={accent} bg={bg} formatTime={formatTime} formatDate={formatDate} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Classroom</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime)).map(s => {
                const isPast = new Date(s.endDatetime) < new Date();
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'white' }}>{s.title}</td>
                    <td>{s.subject?.name || '—'}</td>
                    <td>{s.faculty ? `${s.faculty.firstName} ${s.faculty.lastName}` : '—'}</td>
                    <td>{s.classroom?.name || '—'}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{formatDate(s.startDatetime)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{formatTime(s.startDatetime)} – {formatTime(s.endDatetime)}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${isPast ? 'badge-success' : s.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>
                        {isPast ? 'Completed' : s.status}
                      </span>
                    </td>
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

function SessionCard({ session: s, accent, bg, formatTime, formatDate }) {
  const isPast = new Date(s.endDatetime) < new Date();
  return (
    <div style={{
      background: bg,
      border: `1px solid ${accent}30`,
      borderRadius: '16px',
      padding: '1.25rem',
      borderLeft: `3px solid ${accent}`,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white', lineHeight: 1.3 }}>{s.title}</h4>
        {isPast && (
          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#34d399', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>Done</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        {s.subject && <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}><BookOpen size={13} color={accent} />{s.subject.name}</div>}
        {s.faculty && <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}><User size={13} color={accent} />{s.faculty.firstName} {s.faculty.lastName}</div>}
        {s.classroom && <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}><MapPin size={13} color={accent} />{s.classroom.name} {s.classroom.building ? `· ${s.classroom.building}` : ''}</div>}
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}><Clock size={13} color={accent} />{formatDate(s.startDatetime)} · {formatTime(s.startDatetime)} – {formatTime(s.endDatetime)}</div>
      </div>
    </div>
  );
}
