import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  AlertCircle,
  CheckCircle,
  FileText,
  X,
  Settings,
  TrendingUp,
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
    PAID:            { label: 'Fully Paid',        color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
    CANCELLED:       { label: 'Cancelled',         color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  };
  const cfg = configs[status] || configs.DRAFT;
  return (
    <span style={{
      padding: '0.3rem 0.8rem',
      borderRadius: '9999px',
      fontSize: '0.73rem',
      fontWeight: 700,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

// Reusable modal backdrop + container
function Modal({ title, onClose, children, maxWidth = '560px' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(13,19,33,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        maxWidth,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function FinanceDashboard() {
  const [summary, setSummary] = useState({
    totalBilled: 0, totalCollected: 0, totalPending: 0, countPaid: 0, countInvoiced: 0,
  });
  const [studentFees, setStudentFees] = useState([]);
  const [feeTerms, setFeeTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [assignForm, setAssignForm] = useState({ studentId: '', feeTermId: '', discount: 0, dueDate: '' });
  const [payAmount, setPayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [sum, fees, terms, stus] = await Promise.all([
        fetchFinanceSummary(), fetchStudentFees(), fetchFeeTerms(), fetchStudents(),
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

  useEffect(() => { loadData(); }, []);

  // Live fee preview for Assign modal
  const selectedTerm = feeTerms.find((t) => t.id === Number(assignForm.feeTermId));
  const grossAmount = selectedTerm?.totalAmount ?? 0;
  const discountAmount = grossAmount * (Number(assignForm.discount) / 100);
  const netPreview = grossAmount - discountAmount;

  const handleAssignFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Use noon UTC to prevent timezone date-shifting
      const isoDate = assignForm.dueDate
        ? new Date(assignForm.dueDate + 'T12:00:00.000Z').toISOString()
        : new Date().toISOString();
      await assignStudentFee({
        studentId: Number(assignForm.studentId),
        feeTermId: Number(assignForm.feeTermId),
        discount: Number(assignForm.discount) || 0,
        dueDate: isoDate,
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
    const maxPayable = selectedInvoice.netAmount - selectedInvoice.paidAmount;
    const amount = Math.min(Number(payAmount), maxPayable); // Cap at remaining balance
    setSubmitting(true);
    setError(null);
    try {
      await recordPayment(selectedInvoice.id, amount);
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

  const collectionRate = summary.totalBilled > 0
    ? Math.round((summary.totalCollected / summary.totalBilled) * 100)
    : 0;

  if (loading) return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
      <div className="loading-spinner" />
      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading financial data...</h3>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Header
        actions={
          <Link to="/finance/terms" className="btn-ghost" style={{ textDecoration: 'none' }}>
            <Settings size={16} /> Fee Templates
          </Link>
        }
      />

      {error && (
        <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Billed</span>
            <div className="metric-icon icon-blue"><DollarSign size={20} /></div>
          </div>
          <div className="metric-value">${summary.totalBilled.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Collected</span>
            <div className="metric-icon icon-emerald"><CheckCircle size={20} /></div>
          </div>
          <div className="metric-value" style={{ color: '#34d399' }}>
            ${summary.totalCollected.toLocaleString()}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Outstanding</span>
            <div className="metric-icon icon-pink"><AlertCircle size={20} /></div>
          </div>
          <div className="metric-value" style={{ color: summary.totalPending > 0 ? '#f87171' : 'var(--text-main)' }}>
            ${summary.totalPending.toLocaleString()}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Collection Rate</span>
            <div className="metric-icon icon-purple"><TrendingUp size={20} /></div>
          </div>
          <div className="metric-value">{collectionRate}%</div>
          {/* Progress bar */}
          <div className="progress-bar-wrap" style={{ marginTop: '0.85rem' }}>
            <div className="progress-bar-fill" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Invoices table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Student Invoices ({studentFees.length})
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
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Student</th>
                  <th>Fee Template</th>
                  <th>Gross / Net</th>
                  <th>Paid</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentFees.map((fee) => {
                  const remaining = fee.netAmount - fee.paidAmount;
                  const paidPct = fee.netAmount > 0
                    ? Math.min(100, Math.round((fee.paidAmount / fee.netAmount) * 100))
                    : 0;
                  const overdue = new Date(fee.dueDate) < new Date() && fee.status !== 'PAID';

                  return (
                    <tr key={fee.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {fee.invoiceNumber.replace('INV-', '#')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'white' }}>{fee.student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{fee.student.email}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{fee.feeTerm.name}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'white' }}>${fee.netAmount.toLocaleString()}</div>
                        {fee.discount > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#34d399' }}>{fee.discount}% discount applied</div>
                        )}
                      </td>
                      <td>
                        <div style={{ color: paidPct >= 100 ? '#34d399' : 'var(--text-muted)', fontWeight: 500 }}>
                          ${fee.paidAmount.toLocaleString()}
                        </div>
                        <div style={{ marginTop: '4px', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '9999px', width: '80px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '9999px', width: `${paidPct}%`, background: paidPct >= 100 ? '#34d399' : 'var(--primary)', transition: 'width 0.4s ease' }} />
                        </div>
                      </td>
                      <td>
                        <span style={{ color: overdue ? '#f87171' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(fee.dueDate).toLocaleDateString()}
                          {overdue && <div style={{ fontSize: '0.7rem', color: '#f87171' }}>Overdue</div>}
                        </span>
                      </td>
                      <td><StatusBadge status={fee.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        {fee.status !== 'PAID' && fee.status !== 'CANCELLED' && (
                          <button
                            style={{
                              padding: '0.35rem 0.75rem', fontSize: '0.8rem',
                              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                              borderRadius: '8px', color: '#34d399', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                              fontWeight: 600, whiteSpace: 'nowrap',
                            }}
                            onClick={() => {
                              setSelectedInvoice(fee);
                              setPayAmount(remaining.toFixed(2));
                              setShowPayModal(true);
                            }}
                          >
                            <DollarSign size={13} /> Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Fee Modal */}
      {showAssignModal && (
        <Modal title="Assign Fee Invoice to Student" onClose={() => setShowAssignModal(false)} maxWidth="600px">
          <form onSubmit={handleAssignFee}>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Student</label>
                <select className="form-input" required value={assignForm.studentId}
                  onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}>
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.grade}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Fee Term Template</label>
                <select className="form-input" required value={assignForm.feeTermId}
                  onChange={(e) => setAssignForm({ ...assignForm, feeTermId: e.target.value })}>
                  <option value="">Select a fee term...</option>
                  {feeTerms.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (${t.totalAmount.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discount (%)</label>
                <input className="form-input" type="number" min="0" max="100" placeholder="0"
                  value={assignForm.discount}
                  onChange={(e) => setAssignForm({ ...assignForm, discount: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" required value={assignForm.dueDate}
                  onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
              </div>
            </div>

            {/* Live fee preview */}
            {selectedTerm && (
              <div style={{ background: 'rgba(40,122,231,0.08)', border: '1px solid rgba(40,122,231,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Invoice Preview</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  <span>Gross Amount</span><span>${grossAmount.toLocaleString()}</span>
                </div>
                {Number(assignForm.discount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#34d399', marginBottom: '0.3rem' }}>
                    <span>Discount ({assignForm.discount}%)</span><span>−${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', color: 'white', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span>Net Amount Due</span><span style={{ color: '#29B5F7' }}>${netPreview.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Generating Invoice...' : 'Generate & Issue Invoice'}
            </button>
          </form>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedInvoice && (
        <Modal title="Record Payment" onClose={() => { setShowPayModal(false); setSelectedInvoice(null); }} maxWidth="440px">
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {selectedInvoice.invoiceNumber.replace('INV-', '#')}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginTop: '0.2rem' }}>
              {selectedInvoice.student.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {selectedInvoice.feeTerm.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.9rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Net Total</span>
              <span>${selectedInvoice.netAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Already Paid</span>
              <span style={{ color: '#34d399' }}>${selectedInvoice.paidAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>Balance Remaining</span>
              <span style={{ color: '#f87171' }}>
                ${(selectedInvoice.netAmount - selectedInvoice.paidAmount).toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleRecordPayment}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Payment Amount ($)</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                max={selectedInvoice.netAmount - selectedInvoice.paidAmount}
                step="0.01"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Max payable: ${(selectedInvoice.netAmount - selectedInvoice.paidAmount).toLocaleString()}
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={submitting}
              style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {submitting ? 'Processing...' : 'Confirm & Record Payment'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
