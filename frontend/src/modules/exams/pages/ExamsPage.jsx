import React, { useState, useEffect } from 'react';
import {
  Award, Plus, Search, Calendar, Clock, CheckCircle2,
  AlertCircle, FileText, ChevronRight, Check, X, Edit3, BarChart2, Users
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import {
  fetchExams,
  fetchExamById,
  createExam,
  updateExamStatus,
  saveBulkResults,
  fetchExamStats,
} from '../api/examsApi';
import { fetchCourses, fetchBatches, fetchSubjects } from '../../core/api/coreApi';

const TYPE_CONFIG = {
  FINAL: { label: 'Final Exam', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  MIDTERM: { label: 'Midterm Exam', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  QUIZ: { label: 'Quiz', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  ASSIGNMENT: { label: 'Assignment', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  PRACTICAL: { label: 'Practical Exam', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
};

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
      padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem',
      fontWeight: 800, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`
    }}>
      {grade || 'N/A'}
    </span>
  );
}

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Dropdown options for creating exam
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'FINAL',
    courseId: '',
    batchId: '',
    subjectId: '',
    maxMarks: '100',
    passMarks: '40',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    venue: 'Main Examination Hall',
  });

  // Grading Drawer/Modal state
  const [selectedExam, setSelectedExam] = useState(null);
  const [marksState, setMarksState] = useState({});
  const [remarksState, setRemarksState] = useState({});
  const [savingGrades, setSavingGrades] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [examsData, statsData, coursesData, batchesData, subjectsData] = await Promise.all([
        fetchExams(),
        fetchExamStats(),
        fetchCourses(),
        fetchBatches(),
        fetchSubjects(),
      ]);
      setExams(examsData);
      setStats(statsData);
      setCourses(coursesData);
      setBatches(batchesData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to load exams data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExam(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        type: 'FINAL',
        courseId: '',
        batchId: '',
        subjectId: '',
        maxMarks: '100',
        passMarks: '40',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '12:00',
        venue: 'Main Examination Hall',
      });
      loadAll();
    } catch (err) {
      alert('Error creating exam schedule: ' + (err.message || 'Check form inputs'));
    }
  };

  const handleOpenGrading = async (exam) => {
    try {
      const fullExam = await fetchExamById(exam.id);
      setSelectedExam(fullExam);
      
      const initialMarks = {};
      const initialRemarks = {};

      if (fullExam.results) {
        fullExam.results.forEach((res) => {
          initialMarks[res.studentId] = res.marksObtained;
          initialRemarks[res.studentId] = res.remarks || '';
        });
      }
      setMarksState(initialMarks);
      setRemarksState(initialRemarks);
      setSaveSuccess(false);
    } catch (err) {
      console.error('Failed to open exam details:', err);
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedExam) return;
    try {
      setSavingGrades(true);
      const resultsPayload = (selectedExam.batch?.students || []).map((student) => ({
        studentId: student.id,
        marksObtained: parseFloat(marksState[student.id] || 0),
        remarks: remarksState[student.id] || '',
      }));

      const updated = await saveBulkResults(selectedExam.id, resultsPayload);
      setSelectedExam(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadAll();
    } catch (err) {
      alert('Failed to save grades: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingGrades(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesStatus = filterStatus === 'ALL' || exam.status === filterStatus;
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.1) 100%)',
        border: '1px solid rgba(167,139,250,0.25)',
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
          <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Academic Management
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Exams & Grading Suite
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Schedule examinations, record marks, and monitor institutional academic performance.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', border: 'none' }}
        >
          <Plus size={16} /> Schedule New Exam
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#8b5cf6,#6366f1)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Total Exam Schedules
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats?.totalSchedules || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{stats?.scheduledExams || 0} upcoming</div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#10b981,#06b6d4)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Exams Graded
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>{stats?.completedExams || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{stats?.totalResults || 0} individual marks</div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Average Performance
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>{stats?.averagePercentage || 0}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Institutional mean score</div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Pass Rate
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>{stats?.passRate || 0}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Students meeting pass threshold</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'SCHEDULED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: filterStatus === st ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)',
                background: filterStatus === st ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                color: filterStatus === st ? '#c084fc' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {st === 'ALL' ? 'All Exams' : st === 'SCHEDULED' ? 'Scheduled' : 'Graded'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search exam, subject, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              color: 'white',
              fontSize: '0.85rem',
            }}
          />
        </div>
      </div>

      {/* Exam Schedules Grid / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading examination schedules...</div>
      ) : filteredExams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Award size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No examination schedules found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Create a schedule or adjust your search filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredExams.map((exam) => {
            const typeCfg = TYPE_CONFIG[exam.type] || TYPE_CONFIG.FINAL;
            const isCompleted = exam.status === 'COMPLETED';

            return (
              <div key={exam.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, color: typeCfg.color, background: typeCfg.bg, border: `1px solid ${typeCfg.color}30` }}>
                      {typeCfg.label}
                    </span>
                    <span className={`status-badge ${isCompleted ? 'badge-success' : 'badge-info'}`}>
                      {isCompleted ? 'Graded' : 'Scheduled'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.3rem' }}>{exam.title}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-bright-blue)', fontWeight: 600, marginBottom: '0.75rem' }}>
                    {exam.subject?.name || 'Subject'} ({exam.course?.code || 'Course'})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13.5} style={{ color: 'var(--text-dim)' }} />
                      <span>{new Date(exam.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13.5} style={{ color: 'var(--text-dim)' }} />
                      <span>{exam.startTime} - {exam.endTime} ({exam.venue || 'TBD'})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={13.5} style={{ color: 'var(--text-dim)' }} />
                      <span>Batch: <strong style={{ color: 'white' }}>{exam.batch?.name}</strong> ({exam._count?.results || exam.batch?.students?.length || 0} students)</span>
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Max: <strong style={{ color: 'white' }}>{exam.maxMarks} pts</strong> (Pass: {exam.passMarks})
                  </div>

                  <button
                    onClick={() => handleOpenGrading(exam)}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)', color: isCompleted ? '#34d399' : '#c084fc', border: `1px solid ${isCompleted ? '#10b98140' : '#8b5cf640'}` }}
                  >
                    <Edit3 size={13} /> {isCompleted ? 'Edit Marks' : 'Grade Students'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Schedule Examination</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Set up exam details, course batch, and scoring guidelines.</p>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Semester Final Exam"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Exam Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '0.88rem' }}
                  >
                    <option value="FINAL">Final Exam</option>
                    <option value="MIDTERM">Midterm Exam</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="PRACTICAL">Practical Exam</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Target Course</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '0.88rem' }}
                  >
                    <option value="">Select Course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Target Batch</label>
                  <select
                    required
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '0.88rem' }}
                  >
                    <option value="">Select Batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Subject</label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '0.88rem' }}
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Max Marks</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Pass Marks</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Venue / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Hall B / Online"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', border: 'none' }}>
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK GRADING MODAL / DRAWER */}
      {selectedExam && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1.5rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setSelectedExam(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                Grading & Marksheet
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>{selectedExam.title}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Subject: <span style={{ color: 'white', fontWeight: 600 }}>{selectedExam.subject?.name}</span> | Batch: <span style={{ color: 'white', fontWeight: 600 }}>{selectedExam.batch?.name}</span> | Max Marks: <span style={{ color: '#34d399', fontWeight: 700 }}>{selectedExam.maxMarks}</span>
              </div>
            </div>

            {saveSuccess && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b98150', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={16} /> Grades saved successfully!
              </div>
            )}

            {/* Students Grading Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Student</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email / ID</th>
                    <th style={{ padding: '0.75rem 1rem', width: '140px' }}>Marks ({selectedExam.maxMarks})</th>
                    <th style={{ padding: '0.75rem 1rem', width: '100px' }}>Grade</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedExam.batch?.students || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No enrolled students in this batch.
                      </td>
                    </tr>
                  ) : (
                    (selectedExam.batch?.students || []).map((student) => {
                      const marksVal = marksState[student.id] !== undefined ? marksState[student.id] : '';
                      const numVal = parseFloat(marksVal) || 0;
                      const maxM = selectedExam.maxMarks || 100;
                      const pct = (numVal / maxM) * 100;
                      
                      let calcGrade = 'F';
                      if (pct >= 90) calcGrade = 'A+';
                      else if (pct >= 80) calcGrade = 'A';
                      else if (pct >= 70) calcGrade = 'B';
                      else if (pct >= 60) calcGrade = 'C';
                      else if (pct >= 50) calcGrade = 'D';

                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'white' }}>{student.name}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{student.email}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input
                              type="number"
                              min="0"
                              max={selectedExam.maxMarks}
                              value={marksVal}
                              onChange={(e) => setMarksState({ ...marksState, [student.id]: e.target.value })}
                              style={{
                                width: '100px',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.06)',
                                color: 'white',
                                fontWeight: 700,
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {getGradeBadge(calcGrade)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input
                              type="text"
                              placeholder="Optional remarks..."
                              value={remarksState[student.id] || ''}
                              onChange={(e) => setRemarksState({ ...remarksState, [student.id]: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.03)',
                                color: 'white',
                                fontSize: '0.8rem',
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setSelectedExam(null)} className="btn-secondary">Close</button>
              <button
                type="button"
                onClick={handleSaveGrades}
                disabled={savingGrades}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Check size={16} /> {savingGrades ? 'Saving Marks...' : 'Save & Publish Grades'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
