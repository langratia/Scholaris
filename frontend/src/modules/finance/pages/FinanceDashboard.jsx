import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  X,
  UserCheck,
  Calendar,
  Settings,
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import {
  fetchFinanceSummary,
  fetchFeeTerms,
  fetchStudentFees,
  assignStudentFee,
  recordPayment,
} from '../api/financeApi';
import { fetchStudents } from '../../core/api/coreApi';

function StatusBadge({ status }) {
  const configs = {
    DRAFT:           { label: 'Draft',            color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
    INVOICE_CREATED: { label: 'Invoice Created',  color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    PAID:            { label: 'Fully Paid',       color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
    CANCELLED:       { label: 'Cancelled',        color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  };
  const cfg = configs[status] || configs.DRAFT;
  return (
    <span
      style={{
        padding: '0.3rem 0.8rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        letterSpacing: '0.03em',
      }}
    >
      {cfg.label}
    </span>
  );
}

export default function FinanceDashboard() {
  const [summary, setSummary] = useState({
    totalBilled: 0,
    totalCollected: 0,
    totalPending: 0,
    countPaid: 0,
    countInvoiced: 0,
  });
  const [studentFees, setStudentFees] = useState([]);
  const [feeTerms, setFeeTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [assignForm, setAssignForm] = useState({
    studentId: '',
    feeTermId: '',
    discount: 0,
    dueDate: '',
  });

  const [payAmount, setPayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [sum, fees, terms, stus] = await Promise.all([
        fetchFinanceSummary(),
        fetchStudentFees(),
        fetchFeeTerms(),
        fetchStudents(),
      ]);
      setSummary(sum);
      setStudentFees(fees);
      setFeeTerms(terms);
      setStudents(stus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await assignStudentFee({
        studentId: Number(assignForm.studentId),
        feeTermId: Number(assignForm.feeTermId),
        discount: Number(assignForm.discount) || 0,
        dueDate: new Date(assignForm.dueDate).toISOString(),
      });
      setShowAssignModal(false);
      setAssignForm({ studentId: '', feeTermId: '', discount: 0, dueDate: '' });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    setError(null);

    try {
      await recordPayment(selectedInvoice.id, Number(payAmount));
      setShowPayModal(false);
      setSelectedInvoice(null);
      setPayAmount('');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Header title="Finance & Fees" subtitle="Loading financial engine..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Finance & Fees Registry"
        subtitle="Manage student billing, tuition templates, and payment collections"
        actions={
          <Link to="/finance/terms" className="btn-ghost" style={{ textDecoration: 'none' }}>
            <Settings size={16} /> Fee Templates Setup
          </Link>
        }
      />

      {error && (
        <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Billed</span>
            <div className="metric-icon icon-blue">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">${summary.totalBilled.toLocaleString()}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Collected</span>
            <div className="metric-icon icon-emerald">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#34d399' }}>
            ${summary.totalCollected.toLocaleString()}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Outstanding Balance</span>
            <div className="metric-icon icon-pink">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: summary.totalPending > 0 ? '#f87171' : 'var(--text-main)' }}>
            ${summary.totalPending.toLocaleString()}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Paid Invoices</span>
            <div className="metric-icon icon-purple">
              <FileText size={20} />
            </div>
          </div>
          <div className="metric-value">
            {summary.countPaid} / {summary.countInvoiced}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Student Invoices & Fees ({studentFees.length})
        </h2>
        <button className="btn-submit" onClick={() => setShowAssignModal(true)}>
          <Plus size={16} /> Assign Fee Invoice
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {studentFees.length === 0 ? (
          <div className="empty-state" style={{ border: 'none', background: 'transparent' }}>
            <FileText size={44} style={{ opacity: 0.35, marginBottom: '1rem', color: 'var(--primary)' }} />
            <h3>No Invoices Issued Yet</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>
              Click "Assign Fee Invoice" to bill an enrolled student.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Student</th>
                <th>Fee Template</th>
                <th>Net Amount</th>
                <th>Paid Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentFees.map((fee) => (
                <tr key={fee.id}>
                  <td style={{ fontWeight: 600, color: 'white' }}>{fee.invoiceNumber}</td>
                  <td>
                    <div>
                      <span style={{ color: 'white', fontWeight: 500 }}>{fee.student.name}</span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{fee.student.email}</div>
                    </div>
                  </td>
                  <td>{fee.feeTerm.name}</td>
                  <td style={{ fontWeight: 600, color: 'white' }}>
                    ${fee.netAmount.toLocaleString()}
                    {fee.discount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#34d399', marginLeft: '0.4rem' }}>
                        ({fee.discount}% off)
                      </span>
                    )}
                  </td>
                  <td style={{ color: fee.paidAmount >= fee.netAmount ? '#34d399' : 'var(--text-muted)' }}>
                    ${fee.paidAmount.toLocaleString()}
                  </td>
                  <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={fee.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {fee.status !== 'PAID' && (
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}
                        onClick={() => {
                          setSelectedInvoice(fee);
                          setPayAmount((fee.netAmount - fee.paidAmount).toString());
                          setShowPayModal(true);
                        }}
                      >
                        <DollarSign size={14} /> Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Fee Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'rgba(13,19,33,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '2rem',
            width: '100%',
            maxWidth: '580px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Assign Fee Invoice</h2>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignFee}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Select Enrolled Student</label>
                  <select
                    className="form-input"
                    required
                    value={assignForm.studentId}
                    onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
                  >
                    <option value="">Select a student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email}) — {s.grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Select Fee Term Template</label>
                  <select
                    className="form-input"
                    required
                    value={assignForm.feeTermId}
                    onChange={(e) => setAssignForm({ ...assignForm, feeTermId: e.target.value })}
                  >
                    <option value="">Select a fee term...</option>
                    {feeTerms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (${t.totalAmount.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={assignForm.discount}
                    onChange={(e) => setAssignForm({ ...assignForm, discount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    className="form-input"
                    type="date"
                    required
                    value={assignForm.dueDate}
                    onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Generating Invoice...' : 'Generate & Issue Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'rgba(13,19,33,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '2rem',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Record Payment</h2>
              <button onClick={() => setShowPayModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Invoice #{selectedInvoice.invoiceNumber}</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginTop: '0.2rem' }}>
                {selectedInvoice.student.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                <span>Remaining Due:</span>
                <strong style={{ color: '#f87171' }}>
                  ${(selectedInvoice.netAmount - selectedInvoice.paidAmount).toLocaleString()}
                </strong>
              </div>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Payment Amount ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {submitting ? 'Processing Payment...' : 'Confirm & Record Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
