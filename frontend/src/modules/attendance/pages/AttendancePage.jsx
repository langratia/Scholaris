import React, { useState, useEffect } from 'react';
import Header from '../../../shared/components/Header';
import {
  UserCheck,
  FileSpreadsheet,
  TrendingUp,
  Calendar,
  Search,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  ChevronRight,
  BookOpen,
  Layers,
  User,
} from 'lucide-react';
import {
  fetchAttendanceStats,
  fetchAttendanceSheets,
  fetchAttendanceSheetById,
} from '../api/attendanceApi';

export default function AttendancePage() {
  const [stats, setStats] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, sheetsData] = await Promise.all([
        fetchAttendanceStats(),
        fetchAttendanceSheets(),
      ]);
      setStats(statsData);
      setSheets(sheetsData);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectSheet = async (id) => {
    if (activeSheet?.id === id) {
      setActiveSheet(null);
      return;
    }
    try {
      setLoadingSheet(true);
      const detail = await fetchAttendanceSheetById(id);
      setActiveSheet(detail);
    } catch (err) {
      console.error('Failed to load sheet detail:', err);
    } finally {
      setLoadingSheet(false);
    }
  };

  const filteredSheets = sheets.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.sheetCode?.toLowerCase().includes(q) ||
      s.batch?.name?.toLowerCase().includes(q) ||
      s.course?.title?.toLowerCase().includes(q) ||
      s.faculty?.firstName?.toLowerCase().includes(q) ||
      s.faculty?.lastName?.toLowerCase().includes(q)
    );
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SUBMITTED':   return 'badge-success';
      case 'IN_PROGRESS': return 'badge-info';
      case 'CANCELLED':   return 'badge-danger';
      default:            return 'badge-warning';
    }
  };

  const getAttendancePct = (sheet) => {
    const total = sheet._count?.lines || 0;
    if (total === 0) return null;
    // We don't store per-sheet present count in the list query, so show total lines
    return total;
  };

  return (
    <div>
      <Header />

      <div className="page-body">
        {/* Info Banner */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
          padding: '1rem 1.25rem',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: '14px',
          marginBottom: '1.75rem',
          fontSize: '0.88rem',
          color: '#67e8f9',
        }}>
          <Info size={18} style={{ marginTop: '1px', flexShrink: 0, color: '#22d3ee' }} />
          <div>
            <strong style={{ color: '#22d3ee', fontWeight: 700 }}>Admin Attendance Overview</strong>
            <span style={{ color: '#94a3b8' }}> — This view shows attendance register records across the institution. </span>
            <span style={{ color: '#67e8f9' }}>Attendance check-in is performed by faculty through the <strong>Teacher Portal</strong>.</span>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card" style={{ flex: 1, height: '100px', opacity: 0.4 }} />
            ))}
          </div>
        ) : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="card" style={{ padding: '1.35rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #287AE7, #5147EB)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Total Registers</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalSheets}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={20} style={{ color: '#60a5fa' }} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{stats.submittedSheets} submitted</span>
                <span> · {stats.pendingSheets} pending</span>
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Institution Rate</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: stats.attendanceRate >= 75 ? '#34d399' : '#f87171' }}>
                    {stats.attendanceRate}<span style={{ fontSize: '1rem', fontWeight: 600 }}>%</span>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} style={{ color: '#34d399' }} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats.attendanceRate}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #ec4899)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Total Absent</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#f87171' }}>{stats.absentLines}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={20} style={{ color: '#f87171' }} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Across <strong>{stats.totalLines}</strong> total student-day records
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Late Arrivals</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#fbbf24' }}>{stats.lateLines}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} style={{ color: '#fbbf24' }} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{stats.presentLines}</span> marked present
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: activeSheet ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Registers Table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Attendance Registers</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  All submitted and active attendance sheets across all batches
                </p>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search registers..."
                  style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.82rem', width: '220px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                Loading registers...
              </div>
            ) : filteredSheets.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <FileSpreadsheet size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>No Registers Found</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.83rem', marginTop: '0.25rem' }}>
                  Attendance registers will appear here once faculty submit them via the Teacher Portal.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Register Code</th>
                      <th>Date</th>
                      <th>Batch & Course</th>
                      <th>Supervisor</th>
                      <th>Students</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSheets.map((sheet) => {
                      const dateStr = new Date(sheet.date).toLocaleDateString([], {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      });
                      const isSelected = activeSheet?.id === sheet.id;

                      return (
                        <tr
                          key={sheet.id}
                          onClick={() => selectSheet(sheet.id)}
                          style={{ cursor: 'pointer', background: isSelected ? 'rgba(99,102,241,0.06)' : undefined }}
                        >
                          <td>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace', color: 'white' }}>
                              {sheet.sheetCode}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                              <Calendar size={13} style={{ color: 'var(--text-dim)' }} />
                              {dateStr}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{sheet.batch?.name || '—'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                              {sheet.course?.code || ''} {sheet.course?.title || ''}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <User size={13} style={{ color: 'var(--text-dim)' }} />
                              {sheet.faculty ? `${sheet.faculty.firstName} ${sheet.faculty.lastName}` : '—'}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-bright-blue)' }}>
                              {sheet._count?.lines ?? '—'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(sheet.status)}`}>
                              {sheet.status}
                            </span>
                          </td>
                          <td>
                            <ChevronRight size={16} style={{ color: 'var(--text-dim)', transition: 'transform 0.2s', transform: isSelected ? 'rotate(90deg)' : 'none' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail Panel (read-only) */}
          {activeSheet && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Sheet Header */}
              <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
                      Register Detail
                    </div>
                    <h3 style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 800 }}>{activeSheet.sheetCode}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`status-badge ${getStatusBadgeClass(activeSheet.status)}`}>
                      {activeSheet.status}
                    </span>
                    <button onClick={() => setActiveSheet(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <BookOpen size={14} style={{ color: 'var(--text-dim)', marginTop: '1px', flexShrink: 0 }} />
                    <span><strong style={{ color: 'white' }}>{activeSheet.course?.title}</strong> ({activeSheet.course?.code})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Layers size={14} style={{ color: 'var(--text-dim)', marginTop: '1px', flexShrink: 0 }} />
                    <span>Batch: <strong style={{ color: 'white' }}>{activeSheet.batch?.name}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <User size={14} style={{ color: 'var(--text-dim)', marginTop: '1px', flexShrink: 0 }} />
                    <span>Faculty: <strong style={{ color: 'white' }}>{activeSheet.faculty?.firstName} {activeSheet.faculty?.lastName}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Calendar size={14} style={{ color: 'var(--text-dim)', marginTop: '1px', flexShrink: 0 }} />
                    <span>{new Date(activeSheet.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Mini attendance stats */}
                {activeSheet.lines && (() => {
                  const total = activeSheet.lines.length;
                  const present = activeSheet.lines.filter(l => l.status === 'PRESENT').length;
                  const late = activeSheet.lines.filter(l => l.status === 'LATE').length;
                  const absent = total - present - late;
                  const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
                  return (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Attendance Rate</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: pct >= 75 ? '#34d399' : '#f87171' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : '#ef4444', borderRadius: '4px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Present: <strong style={{ color: 'white' }}>{present}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Absent: <strong style={{ color: 'white' }}>{absent}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Late: <strong style={{ color: 'white' }}>{late}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Student Lines - Read Only */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Student Checklist</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    READ-ONLY
                  </span>
                </div>

                {loadingSheet ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading...</div>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {(activeSheet.lines || []).map((line) => {
                      const statusColors = {
                        PRESENT: { dot: '#34d399', text: '#34d399', bg: 'rgba(16,185,129,0.08)' },
                        LATE: { dot: '#fbbf24', text: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
                        ABSENT_EXCUSED: { dot: '#f87171', text: '#f87171', bg: 'rgba(239,68,68,0.08)' },
                        ABSENT_UNEXCUSED: { dot: '#fda4af', text: '#fda4af', bg: 'rgba(225,29,72,0.08)' },
                      };
                      const sc = statusColors[line.status] || statusColors.PRESENT;
                      const label = {
                        PRESENT: 'Present',
                        LATE: 'Late',
                        ABSENT_EXCUSED: 'Excused',
                        ABSENT_UNEXCUSED: 'Absent',
                      }[line.status] || line.status;

                      return (
                        <div key={line.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.65rem 1.25rem',
                          background: sc.bg,
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{line.student?.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{line.student?.email}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: sc.text }}>{label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
