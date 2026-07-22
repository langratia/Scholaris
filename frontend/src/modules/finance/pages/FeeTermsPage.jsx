import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  ArrowLeft,
  X,
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import { fetchFeeTerms, createFeeTerm } from '../api/financeApi';

// Renders directly into document.body — bypasses all scroll containers
function ModalPortal({ onClose, children, title }) {
  useEffect(() => {
    // Prevent background scroll when modal is open
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'rgba(10,15,28,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2rem',
          width: '100%',
          maxWidth: '660px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function FeeTermsPage() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    totalAmount: '',
  });

  const [installments, setInstallments] = useState([
    { name: '1st Installment', percentage: 50, dueDays: 30 },
    { name: '2nd Installment', percentage: 50, dueDays: 60 },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchFeeTerms();
      setTerms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddInstallment = () => {
    setInstallments([
      ...installments,
      { name: `Installment ${installments.length + 1}`, percentage: 0, dueDays: 90 },
    ]);
  };

  const handleRemoveInstallment = (index) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const handleInstallmentChange = (index, field, value) => {
    const next = [...installments];
    next[index][field] = field === 'name' ? value : Number(value);
    setInstallments(next);
  };

  const totalPercentage = installments.reduce((acc, item) => acc + (item.percentage || 0), 0);
  const percentValid = Math.abs(totalPercentage - 100) < 0.01;

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setForm({ name: '', code: '', description: '', totalAmount: '' });
    setInstallments([
      { name: '1st Installment', percentage: 50, dueDays: 30 },
      { name: '2nd Installment', percentage: 50, dueDays: 60 },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!percentValid) {
      setError(`Installment percentages must sum to exactly 100% (currently ${totalPercentage}%)`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createFeeTerm({
        ...form,
        totalAmount: Number(form.totalAmount),
        installments,
      });
      handleCloseModal();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
      <div className="loading-spinner" />
      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading fee templates...</h3>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Header
        actions={
          <Link to="/finance" className="btn-ghost" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Finance
          </Link>
        }
      />

      {/* Page-level errors (not modal errors) */}
      {error && !showModal && (
        <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Fee Templates ({terms.length})
        </h2>
        <button className="btn-submit" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Fee Term Template
        </button>
      </div>

      {/* Fee Term Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {terms.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <CreditCard size={44} style={{ opacity: 0.35, marginBottom: '1rem', color: 'var(--primary)' }} />
            <h3>No Fee Terms Defined</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>
              Create your first fee term template (e.g., Annual Undergraduate Tuition) to start billing students.
            </p>
          </div>
        ) : (
          terms.map((term) => (
            <div key={term.id} className="item-card">
              <div>
                <div className="card-top">
                  <h3 className="card-heading">{term.name}</h3>
                  <span className="badge-tag">{term.code}</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399', margin: '0.75rem 0' }}>
                  ${term.totalAmount.toLocaleString()}
                </div>
                {term.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {term.description}
                  </p>
                )}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Installment Breakdown ({term.installments.length})
                  </div>
                  {term.installments.map((inst) => (
                    <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span>{inst.name} <span style={{ opacity: 0.6 }}>({inst.percentage}%)</span></span>
                      <span style={{ color: 'white', fontWeight: 600 }}>
                        ${((term.totalAmount * inst.percentage) / 100).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Assigned to <strong style={{ color: 'white' }}>{term._count?.studentFees || 0}</strong> student(s)
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Fee Term Modal — rendered via Portal into document.body */}
      {showModal && (
        <ModalPortal title="New Fee Term Template" onClose={handleCloseModal}>
          {/* Modal-level error */}
          {error && (
            <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Template Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Annual Undergraduate Tuition 2026"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unique Code</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. UG-2026-FEE"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Fee Amount ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="e.g. 5000"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description (Optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Includes Tuition, Library Access, and Sports Levy"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {/* Installments Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${percentValid ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', transition: 'border-color 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Installment Structure</h4>
                  <div style={{ fontSize: '0.8rem', color: percentValid ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: percentValid ? '#34d399' : '#f87171' }} />
                    {totalPercentage}% allocated {percentValid ? '— ✓ Ready' : `— needs ${(100 - totalPercentage).toFixed(1)}% more`}
                  </div>
                </div>
                <button type="button" className="btn-ghost" onClick={handleAddInstallment} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add Line
                </button>
              </div>

              {/* Column Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 32px', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Name</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>%</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Due Days</span>
                <span />
              </div>

              {installments.map((inst, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 32px', gap: '0.75rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <input
                    className="form-input"
                    required
                    placeholder="Installment Name"
                    value={inst.name}
                    onChange={(e) => handleInstallmentChange(index, 'name', e.target.value)}
                  />
                  <input
                    className="form-input"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    required
                    placeholder="%"
                    value={inst.percentage}
                    onChange={(e) => handleInstallmentChange(index, 'percentage', e.target.value)}
                  />
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    placeholder="Days"
                    value={inst.dueDays}
                    onChange={(e) => handleInstallmentChange(index, 'dueDays', e.target.value)}
                  />
                  {installments.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstallment(index)}
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={14} />
                    </button>
                  ) : <span />}
                </div>
              ))}

              {/* Live amount preview */}
              {form.totalAmount && Number(form.totalAmount) > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {installments.map((inst, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.15rem 0' }}>
                      <span>{inst.name}</span>
                      <span style={{ color: 'white', fontWeight: 600 }}>
                        ${((Number(form.totalAmount) * inst.percentage) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={submitting || !percentValid}
              style={{ width: '100%', opacity: (!percentValid) ? 0.6 : 1 }}
            >
              {submitting ? 'Creating Template...' : 'Save Fee Term Template'}
            </button>
          </form>
        </ModalPortal>
      )}
    </div>
  );
}
