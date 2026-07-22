import React from 'react';
import { useStudentPortal } from '../context/StudentPortalContext';
import { CreditCard, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function StudentBillingPage() {
  const { student } = useStudentPortal();
  const fees = student?.studentFees || [];

  const totalBilled = fees.reduce((s, f) => s + f.netAmount, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalOutstanding = totalBilled - totalPaid;
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID': return 'badge-success';
      case 'INVOICE_CREATED': return 'badge-warning';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PAID': return 'Fully Paid';
      case 'INVOICE_CREATED': return 'Invoice Issued';
      case 'CANCELLED': return 'Cancelled';
      case 'DRAFT': return 'Draft';
      default: return status;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Fees & Billing</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Your academic fee invoices and payment history.</p>
      </div>

      {/* Summary widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#287AE7,#5147EB)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Total Billed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${totalBilled.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{fees.length} invoice{fees.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#10b981,#06b6d4)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Total Paid</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>${totalPaid.toLocaleString()}</div>
          <div style={{ marginTop: '0.5rem', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${collectionRate}%`, background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: '4px', transition: 'width 0.6s' }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{collectionRate}% of total billed</div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: totalOutstanding > 0 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#10b981,#06b6d4)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Outstanding</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: totalOutstanding > 0 ? '#fbbf24' : '#34d399' }}>
            ${totalOutstanding.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {totalOutstanding <= 0
              ? <><CheckCircle2 size={13} color="#34d399" /> All cleared</>
              : <><AlertTriangle size={13} color="#f59e0b" /> Requires payment</>
            }
          </div>
        </div>
      </div>

      {/* Invoices list */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Invoices</h2>

      {fees.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <CreditCard size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No invoices issued</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your fee invoices will appear here once assigned by the finance office.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fees.map(fee => {
            const remaining = fee.netAmount - fee.paidAmount;
            const paidPct = fee.netAmount > 0 ? Math.min(100, Math.round((fee.paidAmount / fee.netAmount) * 100)) : 0;
            const isPaid = fee.status === 'PAID';
            const overdue = new Date(fee.dueDate) < new Date() && !isPaid;

            return (
              <div key={fee.id} className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                {overdue && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#ef4444' }} />}
                {isPaid && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#10b981,#06b6d4)' }} />}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{fee.feeTerm.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'monospace', marginTop: '2px' }}>
                      {fee.invoiceNumber}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {overdue && <span className="status-badge badge-danger">Overdue</span>}
                    <span className={`status-badge ${getStatusBadgeClass(fee.status)}`}>{getStatusLabel(fee.status)}</span>
                  </div>
                </div>

                {/* Amounts row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Amount</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>${fee.netAmount.toLocaleString()}</div>
                    {fee.discount > 0 && <div style={{ fontSize: '0.72rem', color: '#34d399' }}>{fee.discount}% discount applied</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Paid</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>${fee.paidAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance Due</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isPaid ? '#34d399' : overdue ? '#f87171' : '#fbbf24' }}>
                      ${remaining.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: overdue ? '#f87171' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {overdue && <AlertTriangle size={13} />}
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                    <span>Payment Progress</span>
                    <span style={{ color: isPaid ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>{paidPct}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${paidPct}%`, background: isPaid ? 'linear-gradient(90deg,#10b981,#06b6d4)' : 'linear-gradient(90deg,#287AE7,#5147EB)', borderRadius: '4px', transition: 'width 0.6s' }} />
                  </div>
                </div>

                {/* Installments if any */}
                {fee.feeTerm.installments?.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Installment Structure</div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {fee.feeTerm.installments.map(inst => (
                        <div key={inst.id} style={{
                          padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)',
                        }}>
                          <span style={{ color: 'white', fontWeight: 600 }}>{inst.name}</span> — {inst.percentage}% (due in {inst.dueDays}d)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
