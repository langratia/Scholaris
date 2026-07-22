import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, X, Check, ChevronDown,
  UserCheck, Briefcase, DollarSign, Clock, CheckCircle2,
  XCircle, AlertCircle, Building2, Phone, Mail, CalendarDays, Edit2
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import { hrApi } from '../api/hrApi';
import { fetchDepartments } from '../../core/api/coreApi';

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY'];
const ROLES = ['Principal', 'Vice Principal', 'Accountant', 'Admin Clerk', 'Librarian', 'Counselor', 'Security', 'Janitor', 'Driver', 'Nurse', 'IT Technician', 'Other'];

const inputStyle = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
  color: 'white', fontSize: '0.88rem', boxSizing: 'border-box',
};
const selectStyle = { ...inputStyle, background: '#1e293b' };
const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' };

function StatusBadge({ status }) {
  const cfg = {
    ACTIVE:      { color: '#34d399', bg: 'rgba(52,211,153,0.15)',  label: 'Active' },
    INACTIVE:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: 'Inactive' },
    TERMINATED:  { color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Terminated' },
    PENDING:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  label: 'Pending' },
    APPROVED:    { color: '#34d399', bg: 'rgba(52,211,153,0.15)',  label: 'Approved' },
    REJECTED:    { color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Rejected' },
  }[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: status };

  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
      fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`
    }}>{cfg.label}</span>
  );
}

function TypeBadge({ type }) {
  const isTeaching = type === 'TEACHING';
  return (
    <span style={{
      padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700,
      color: isTeaching ? '#a78bfa' : '#60a5fa',
      background: isTeaching ? 'rgba(167,139,250,0.12)' : 'rgba(96,165,250,0.12)',
    }}>
      {isTeaching ? 'Teaching' : 'Non-Teaching'}
    </span>
  );
}

export default function HRPage() {
  const [activeTab, setActiveTab] = useState('employees'); // employees | leaves | payroll
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterLeaveStatus, setFilterLeaveStatus] = useState('ALL');

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'Admin Clerk',
    employeeType: 'NON_TEACHING', departmentId: '', salary: '', joinDate: new Date().toISOString().split('T')[0], status: 'ACTIVE'
  });
  const [adding, setAdding] = useState(false);

  // Leave Submit Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '', leaveType: 'ANNUAL',
    startDate: '', endDate: '', reason: ''
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Review feedback
  const [reviewSuccess, setReviewSuccess] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [empRes, leaveRes, statsRes, deptRes] = await Promise.all([
        hrApi.getEmployees(),
        hrApi.getLeaves(),
        hrApi.getStats(),
        fetchDepartments(),
      ]);
      if (empRes.success) setEmployees(empRes.data);
      if (leaveRes.success) setLeaves(leaveRes.data);
      if (statsRes.success) setStats(statsRes.data);
      setDepartments(deptRes || []);
    } catch (err) {
      console.error('Failed to load HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      const res = await hrApi.createEmployee(addForm);
      if (res.success) {
        setShowAddModal(false);
        setAddForm({ firstName: '', lastName: '', email: '', phone: '', role: 'Admin Clerk', employeeType: 'NON_TEACHING', departmentId: '', salary: '', joinDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' });
        loadAll();
      }
    } catch (err) {
      alert('Error adding employee: ' + (err.message || 'Check inputs'));
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      setSubmittingLeave(true);
      const { employeeId, ...rest } = leaveForm;
      const res = await hrApi.submitLeave(employeeId, rest);
      if (res.success) {
        setShowLeaveModal(false);
        setLeaveForm({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
        loadAll();
      }
    } catch (err) {
      alert('Error submitting leave: ' + (err.message || 'Check inputs'));
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleReviewLeave = async (id, status) => {
    try {
      await hrApi.reviewLeave(id, { status, reviewedBy: 'Admin' });
      setReviewSuccess(id);
      setTimeout(() => setReviewSuccess(null), 2500);
      loadAll();
    } catch (err) {
      alert('Review failed: ' + err.message);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchType = filterType === 'ALL' || emp.employeeType === filterType;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term);
    return matchType && matchSearch;
  });

  const filteredLeaves = leaves.filter(l =>
    filterLeaveStatus === 'ALL' || l.status === filterLeaveStatus
  );

  const leaveDays = (leave) => {
    const ms = new Date(leave.endDate) - new Date(leave.startDate);
    return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(139,92,246,0.06) 100%)',
        border: '1px solid rgba(167,139,250,0.22)', borderRadius: '20px',
        padding: '1.75rem 2rem', marginBottom: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Human Resources
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Employee Management
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Manage school staff, track leave requests, and monitor payroll summaries.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)' }}
          >
            <CalendarDays size={15} /> Submit Leave
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none' }}
          >
            <Plus size={15} /> Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Staff', value: stats?.totalEmployees || 0, color: '#a78bfa', gradient: 'linear-gradient(90deg,#7c3aed,#6d28d9)' },
          { label: 'Active Employees', value: stats?.activeEmployees || 0, color: '#34d399', gradient: 'linear-gradient(90deg,#10b981,#06b6d4)' },
          { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, color: '#fbbf24', gradient: 'linear-gradient(90deg,#f59e0b,#d97706)' },
          { label: 'Monthly Payroll', value: stats ? `$${(stats.totalMonthlyPayroll / 1000).toFixed(1)}K` : '—', color: '#60a5fa', gradient: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.gradient }} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', gap: '1.5rem' }}>
        {[
          { id: 'employees', label: 'Employee Directory', icon: Users },
          { id: 'leaves', label: 'Leave Requests', icon: CalendarDays },
          { id: 'payroll', label: 'Payroll Overview', icon: DollarSign },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.6rem 0.2rem', background: 'none', border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #a78bfa' : '2px solid transparent',
              color: activeTab === t.id ? '#a78bfa' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
          >
            <t.icon size={16} />
            {t.label}
            {t.id === 'leaves' && stats?.pendingLeaves > 0 && (
              <span style={{ marginLeft: '0.2rem', background: '#fbbf24', color: '#1e293b', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.45rem' }}>
                {stats.pendingLeaves}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── EMPLOYEE DIRECTORY TAB ── */}
      {activeTab === 'employees' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'TEACHING', 'NON_TEACHING'].map(t => (
                <button key={t} onClick={() => setFilterType(t)} style={{
                  padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  border: filterType === t ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.08)',
                  background: filterType === t ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.03)',
                  color: filterType === t ? '#a78bfa' : 'var(--text-muted)',
                }}>
                  {t === 'NON_TEACHING' ? 'Non-Teaching' : t === 'TEACHING' ? 'Teaching' : 'All Staff'}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text" placeholder="Search name, role, email..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.2rem' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No employees found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Add a new employee or adjust your search.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Employee</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Role</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Department</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Type</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Salary</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Join Date</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.78rem', color: 'white'
                            }}>
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'white' }}>{emp.firstName} {emp.lastName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 500 }}>{emp.role}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>{emp.department?.name || '—'}</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}><TypeBadge type={emp.employeeType} /></td>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#34d399' }}>${emp.salary.toLocaleString()}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(emp.joinDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}><StatusBadge status={emp.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── LEAVE REQUESTS TAB ── */}
      {activeTab === 'leaves' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => setFilterLeaveStatus(s)} style={{
                padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                border: filterLeaveStatus === s ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.08)',
                background: filterLeaveStatus === s ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.03)',
                color: filterLeaveStatus === s ? '#a78bfa' : 'var(--text-muted)',
              }}>
                {s === 'ALL' ? 'All Requests' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Employee</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Leave Type</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Duration</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Reason</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'white' }}>{l.employee?.firstName} {l.employee?.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{l.employee?.role} · {l.employee?.department?.name || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.12)' }}>
                            {l.leaveType}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <div>{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</div>
                          <div style={{ fontWeight: 700, color: 'white' }}>{leaveDays(l)} day{leaveDays(l) !== 1 ? 's' : ''}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '220px' }}>
                          <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {l.reason || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {reviewSuccess === l.id ? (
                            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={14} /> Done
                            </span>
                          ) : (
                            <StatusBadge status={l.status} />
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {l.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleReviewLeave(l.id, 'APPROVED')}
                                style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.1)', color: '#34d399', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                onClick={() => handleReviewLeave(l.id, 'REJECTED')}
                                style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.1)', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <X size={13} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── PAYROLL OVERVIEW TAB ── */}
      {activeTab === 'payroll' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Summary card */}
            <div className="card" style={{ gridColumn: '1 / -1', padding: '1.5rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Monthly Payroll Summary</div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>${(stats?.totalMonthlyPayroll || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total monthly salary for {stats?.activeEmployees || 0} active staff</div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '2rem' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>
                    ${stats?.totalMonthlyPayroll ? Math.round(stats.totalMonthlyPayroll / (stats.activeEmployees || 1)).toLocaleString() : 0}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Average salary per employee</div>
                </div>
              </div>
            </div>
          </div>

          {/* Per-employee payroll table */}
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Employee Salary Ledger</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Employee</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Role</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Department</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Type</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Monthly Salary</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(e => e.status === 'ACTIVE').map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'white' }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.email}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>{emp.role}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>{emp.department?.name || '—'}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}><TypeBadge type={emp.employeeType} /></td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, fontSize: '1rem', color: '#34d399' }}>
                        ${emp.salary.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}><StatusBadge status={emp.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD EMPLOYEE MODAL ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Add New Employee</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Register a new staff member in the employee directory.</p>

            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" required value={addForm.firstName} onChange={e => setAddForm({ ...addForm, firstName: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" required value={addForm.lastName} onChange={e => setAddForm({ ...addForm, lastName: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone (Optional)</label>
                  <input type="tel" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Role / Position</label>
                  <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })} style={selectStyle}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Employee Type</label>
                  <select value={addForm.employeeType} onChange={e => setAddForm({ ...addForm, employeeType: e.target.value })} style={selectStyle}>
                    <option value="NON_TEACHING">Non-Teaching</option>
                    <option value="TEACHING">Teaching</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Department (Optional)</label>
                  <select value={addForm.departmentId} onChange={e => setAddForm({ ...addForm, departmentId: e.target.value })} style={selectStyle}>
                    <option value="">No Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Monthly Salary ($)</label>
                  <input type="number" required min="0" placeholder="e.g. 3500" value={addForm.salary} onChange={e => setAddForm({ ...addForm, salary: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Join Date</label>
                  <input type="date" required value={addForm.joinDate} onChange={e => setAddForm({ ...addForm, joinDate: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }} />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })} style={selectStyle}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={adding} className="btn-primary" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={15} /> {adding ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBMIT LEAVE MODAL ── */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setShowLeaveModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Submit Leave Request</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>File a leave request on behalf of an employee.</p>

            <form onSubmit={handleSubmitLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Employee</label>
                <select required value={leaveForm.employeeId} onChange={e => setLeaveForm({ ...leaveForm, employeeId: e.target.value })} style={selectStyle}>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} — {emp.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Leave Type</label>
                <select value={leaveForm.leaveType} onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })} style={selectStyle}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Reason (Optional)</label>
                <textarea rows={3} placeholder="Brief reason for the leave..." value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submittingLeave} className="btn-primary" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none' }}>
                  {submittingLeave ? 'Submitting...' : 'Submit Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
