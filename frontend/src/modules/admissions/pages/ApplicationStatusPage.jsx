import React, { useState } from 'react';
import { checkApplicationStatus } from '../api/admissionsApi';
import { Search, Info, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApplicationStatusPage() {
  const [formData, setFormData] = useState({ applicationNumber: '', email: '' });
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatusResult(null);
    setLoading(true);
    try {
      const res = await checkApplicationStatus(formData.applicationNumber, formData.email);
      setStatusResult(res);
    } catch (err) {
      setError(err.message || 'Could not find an application with those details.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusCard = () => {
    if (!statusResult) return null;

    const s = statusResult.status;
    let icon, color, title, description;

    switch (s) {
      case 'SUBMITTED':
        icon = <FileText size={48} color="#60a5fa" />; color = '#60a5fa';
        title = "Application Received";
        description = "We have received your application and it is currently awaiting review by our admissions team.";
        break;
      case 'PROCESSING':
        icon = <Clock size={48} color="#fbbf24" />; color = '#fbbf24';
        title = "Under Review";
        description = "Your application is currently being evaluated. We will notify you once a decision is made.";
        break;
      case 'ADMISSION_CONFIRM':
      case 'DONE':
        icon = <CheckCircle2 size={48} color="#34d399" />; color = '#34d399';
        title = "Admission Offered!";
        description = "Congratulations! You have been accepted. Please check your email for further enrollment instructions.";
        break;
      case 'REJECTED':
        icon = <XCircle size={48} color="#f87171" />; color = '#f87171';
        title = "Admission Declined";
        description = "Unfortunately, we are unable to offer you admission at this time. Thank you for your interest.";
        break;
      default:
        icon = <Info size={48} color="#94a3b8" />; color = '#94a3b8';
        title = "Status Unknown";
        description = "Please contact the admissions office for more details.";
    }

    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem', marginTop: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color, marginBottom: '0.75rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto' }}>
          {description}
        </p>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: 'var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'left', maxWidth: '350px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Applicant Name</span>
            <span style={{ fontWeight: 600 }}>{statusResult.firstName} {statusResult.lastName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Target Course</span>
            <span style={{ fontWeight: 600 }}>{statusResult.targetCourse}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Date Applied</span>
            <span style={{ fontWeight: 600 }}>{new Date(statusResult.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Check Application Status
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Enter your details below to track the progress of your admission.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
          
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Application Tracking Number</label>
            <input required type="text" name="applicationNumber" className="form-input" placeholder="e.g. APP-123456789-123" value={formData.applicationNumber} onChange={handleChange} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Email Address</label>
            <input required type="email" name="email" className="form-input" placeholder="Email used during application" value={formData.email} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Checking...' : 'Check Status'} <Search size={18} />
          </button>
        </form>
      </div>

      {renderStatusCard()}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/apply" style={{ color: 'var(--accent-bright-blue)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          &larr; Back to Open Admissions
        </Link>
      </div>
    </div>
  );
}
