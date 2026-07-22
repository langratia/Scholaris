import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  ArrowLeft,
  X,
  Layers,
  Percent,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import { fetchFeeTerms, createFeeTerm } from '../api/financeApi';

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

  useEffect(() => {
    loadData();
  }, []);

  const handleAddInstallment = () => {
    setInstallments([
      ...installments,
      { name: `${installments.length + 1}th Installment`, percentage: 0, dueDays: 90 },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError('Installment percentages must sum up to exactly 100%');
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
      setShowModal(false);
      setForm({ name: '', code: '', description: '', totalAmount: '' });
      setInstallments([
        { name: '1st Installment', percentage: 50, dueDays: 30 },
        { name: '2nd Installment', percentage: 50, dueDays: 60 },
      ]);
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
        <Header title="Fee Terms Setup" subtitle="Loading fee templates..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Fee Terms & Templates"
        subtitle="Define recurring tuition fee structures and installment breakdowns"
        actions={
          <Link to="/finance" className="btn-ghost" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Finance Dashboard
          </Link>
        }
      />

      {error && (
        <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
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
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Installment Breakdown ({term.installments.length})
                  </div>
                  {term.installments.map((inst) => (
                    <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.25rem 0', color: 'var(--text-muted)' }}>
                      <span>{inst.name} ({inst.percentage}%)</span>
                      <span style={{ color: 'white', fontWeight: 600 }}>
                        ${((term.totalAmount * inst.percentage) / 100).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Assigned to {term._count?.studentFees || 0} students</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
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
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New Fee Term Template</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

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
                  <label className="form-label">Code</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. UG-2026-FEE"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
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
                    placeholder="Includes Tuition, Library Access, and Sports Levy"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Installments Setup */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Installment Structure</h4>
                    <span style={{ fontSize: '0.8rem', color: totalPercentage === 100 ? '#34d399' : '#f87171' }}>
                      Total Percentage: {totalPercentage}% {totalPercentage === 100 ? '✓ Valid' : '(Must equal 100%)'}
                    </span>
                  </div>
                  <button type="button" className="btn-ghost" onClick={handleAddInstallment} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <Plus size={14} /> Add Line
                  </button>
                </div>

                {installments.map((inst, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
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
                      min="1"
                      max="100"
                      required
                      placeholder="%"
                      value={inst.percentage}
                      onChange={(e) => handleInstallmentChange(index, 'percentage', e.target.value)}
                    />
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      placeholder="Due Days"
                      value={inst.dueDays}
                      onChange={(e) => handleInstallmentChange(index, 'dueDays', e.target.value)}
                    />
                    {installments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInstallment(index)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.4rem' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-submit" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Creating Template...' : 'Save Fee Term Template'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
