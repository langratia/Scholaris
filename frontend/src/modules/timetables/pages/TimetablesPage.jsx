import React, { useState, useEffect } from 'react';
import Header from '../../../shared/components/Header';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Layers,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Building,
} from 'lucide-react';
import {
  fetchSessions,
  createSession,
  updateSessionStatus,
  fetchClassrooms,
  createClassroom,
} from '../api/timetablesApi';
import {
  fetchCourses,
  fetchFaculty,
  fetchBatches,
  createBatch,
  fetchSubjects,
  createSubject,
} from '../../core/api/coreApi';

export default function TimetablesPage() {
  const [sessions, setSessions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Modals
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Alert State
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [sessionForm, setSessionForm] = useState({
    title: '',
    courseId: '',
    batchId: '',
    subjectId: '',
    facultyId: '',
    classroomId: '',
    startDatetime: '',
    endDatetime: '',
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    code: '',
    capacity: 30,
    building: '',
    facilities: '',
  });

  const [batchForm, setBatchForm] = useState({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    courseId: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    weightage: 1.0,
    type: 'Theory',
    courseId: '',
    departmentId: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sesData, rmData, crsData, facData, btcData, sbjData] = await Promise.all([
        fetchSessions(),
        fetchClassrooms(),
        fetchCourses(),
        fetchFaculty(),
        fetchBatches(),
        fetchSubjects(),
      ]);
      setSessions(sesData);
      setClassrooms(rmData);
      setCourses(crsData);
      setFaculty(facData);
      setBatches(btcData);
      setSubjects(sbjData);
    } catch (err) {
      console.error('Failed loading timetables data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await createSession(sessionForm);
      setSuccessMsg('Session scheduled successfully without any resource collisions!');
      setShowSessionModal(false);
      setSessionForm({
        title: '',
        courseId: '',
        batchId: '',
        subjectId: '',
        facultyId: '',
        classroomId: '',
        startDatetime: '',
        endDatetime: '',
      });
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Scheduling conflict or error occurred.');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createClassroom(roomForm);
      setShowRoomModal(false);
      setRoomForm({ name: '', code: '', capacity: 30, building: '', facilities: '' });
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createBatch(batchForm);
      setShowBatchModal(false);
      setBatchForm({ name: '', code: '', startDate: '', endDate: '', courseId: '' });
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createSubject(subjectForm);
      setShowSubjectModal(false);
      setSubjectForm({ name: '', code: '', weightage: 1.0, type: 'Theory', courseId: '', departmentId: '' });
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateSessionStatus(id, status);
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const filteredSessions = sessions.filter(s => statusFilter === 'ALL' || s.status === statusFilter);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'badge-success';
      case 'DONE': return 'badge-info';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div>
      <Header
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowRoomModal(true)}>
              <Building size={15} /> Room
            </button>
            <button className="btn btn-secondary" onClick={() => setShowBatchModal(true)}>
              <Layers size={15} /> Batch
            </button>
            <button className="btn btn-primary" onClick={() => setShowSessionModal(true)}>
              <Plus size={16} /> Schedule Session
            </button>
          </div>
        }
      />

      <div className="page-body">
        {/* Messages */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px', padding: '0.88rem 1.25rem', color: '#fca5a5',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem'
          }}>
            <AlertTriangle size={18} />
            <div style={{ flex: 1 }}>{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px', padding: '0.88rem 1.25rem', color: '#86efac',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} />
            <div style={{ flex: 1 }}>{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: '#86efac', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Total Sessions
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{sessions.length}</div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Confirmed
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {sessions.filter(s => s.status === 'CONFIRMED').length}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Classrooms
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
              {classrooms.length}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Intake Batches
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {batches.length}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <Filter size={16} /> Filter Status:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'DRAFT', 'CONFIRMED', 'DONE', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.4rem 0.88rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
                  background: statusFilter === st ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.03)',
                  color: statusFilter === st ? 'white' : 'var(--text-muted)',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Academic Timetable Sessions</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{filteredSessions.length} session(s) listed</span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading timetable data...</div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <Calendar size={40} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No Sessions Scheduled</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Click "Schedule Session" above to create classroom timing entries without overlap conflicts.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session Title</th>
                    <th>Course & Subject</th>
                    <th>Intake Batch</th>
                    <th>Faculty & Classroom</th>
                    <th>Timing Window</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => {
                    const startStr = new Date(session.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(session.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const dateStr = new Date(session.startDatetime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <tr key={session.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{session.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>ID: #{session.id}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 500 }}>
                            <BookOpen size={14} style={{ color: 'var(--accent-purple)' }} />
                            {session.course?.code || 'N/A'} - {session.subject?.name || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                            <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />
                            {session.batch?.name || 'Unassigned'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <User size={13} style={{ color: 'var(--text-muted)' }} />
                            {session.faculty ? `${session.faculty.firstName} ${session.faculty.lastName}` : 'Unassigned'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                            <MapPin size={12} />
                            {session.classroom ? `${session.classroom.name} (${session.classroom.code})` : 'TBD'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            <Clock size={14} style={{ color: 'var(--accent-emerald)' }} />
                            {startStr} - {endStr}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{dateStr}</div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(session.status)}`}>
                            {session.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {session.status === 'DRAFT' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => handleStatusChange(session.id, 'CONFIRMED')}
                              >
                                Confirm
                              </button>
                            )}
                            {session.status === 'CONFIRMED' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => handleStatusChange(session.id, 'DONE')}
                              >
                                Mark Done
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Schedule Session */}
        {showSessionModal && (
          <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
            <div className="modal-content card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Schedule Timetable Session</h3>
                <button onClick={() => setShowSessionModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Session Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS101 Advanced Data Structures Lecture"
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Target Course</label>
                    <select
                      className="form-input"
                      value={sessionForm.courseId}
                      onChange={(e) => setSessionForm({ ...sessionForm, courseId: e.target.value })}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Intake Batch</label>
                    <select
                      className="form-input"
                      value={sessionForm.batchId}
                      onChange={(e) => setSessionForm({ ...sessionForm, batchId: e.target.value })}
                      required
                    >
                      <option value="">Select Batch</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Subject</label>
                    <select
                      className="form-input"
                      value={sessionForm.subjectId}
                      onChange={(e) => setSessionForm({ ...sessionForm, subjectId: e.target.value })}
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Assigned Faculty</label>
                    <select
                      className="form-input"
                      value={sessionForm.facultyId}
                      onChange={(e) => setSessionForm({ ...sessionForm, facultyId: e.target.value })}
                      required
                    >
                      <option value="">Select Faculty Member</option>
                      {faculty.map(f => <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Classroom / Room</label>
                  <select
                    className="form-input"
                    value={sessionForm.classroomId}
                    onChange={(e) => setSessionForm({ ...sessionForm, classroomId: e.target.value })}
                    required
                  >
                    <option value="">Select Classroom</option>
                    {classrooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.code}) - Cap: {r.capacity}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Start Datetime</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={sessionForm.startDatetime}
                      onChange={(e) => setSessionForm({ ...sessionForm, startDatetime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">End Datetime</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={sessionForm.endDatetime}
                      onChange={(e) => setSessionForm({ ...sessionForm, endDatetime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSessionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: New Classroom */}
        {showRoomModal && (
          <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
            <div className="modal-content card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Classroom / Room</h3>
                <button onClick={() => setShowRoomModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Classroom Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Science Lab 101"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Room Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. LAB-101"
                      value={roomForm.code}
                      onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Seating Capacity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Building / Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Science Block, 2nd Floor"
                    value={roomForm.building}
                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRoomModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: New Batch */}
        {showBatchModal && (
          <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
            <div className="modal-content card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Intake Batch</h3>
                <button onClick={() => setShowBatchModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Batch Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Fall 2026 CS Batch"
                    value={batchForm.name}
                    onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Batch Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BTC-CS-2026"
                      value={batchForm.code}
                      onChange={(e) => setBatchForm({ ...batchForm, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Associated Course</label>
                    <select
                      className="form-input"
                      value={batchForm.courseId}
                      onChange={(e) => setBatchForm({ ...batchForm, courseId: e.target.value })}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={batchForm.startDate}
                      onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={batchForm.endDate}
                      onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBatchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
