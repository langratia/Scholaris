import React, { useState, useEffect } from 'react';
import { fetchRegisters, createApplication as submitApplication } from '../api/admissionsApi';
import { BookOpen, Calendar, ChevronRight, User, GraduationCap, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentApplyPage() {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegister, setSelectedRegister] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', birthDate: '',
    email: '', phone: '', targetCourse: '', previousInstitution: '', previousCourse: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successApp, setSuccessApp] = useState(null);

  useEffect(() => {
    fetchRegisters().then(data => {
      // Only show GATHERING or CONFIRMED for public application
      setRegisters(data.filter(r => ['GATHERING', 'CONFIRMED'].includes(r.status)));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleApplyClick = (reg) => {
    setSelectedRegister(reg);
    setFormData(prev => ({ ...prev, targetCourse: reg.targetCourse }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Create full ISO date string from date input
      const birthDate = new Date(formData.birthDate).toISOString();
      
      const payload = {
        ...formData,
        birthDate,
        registerId: selectedRegister.id,
      };
      
      const res = await submitApplication(payload);
      setSuccessApp(res);
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successApp) {
    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <CheckCircle2 size={64} style={{ color: '#34d399', margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Application Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Thank you, {successApp.firstName}. We have received your application.
        </p>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: 'var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Your Application Tracking Number
          </div>
          <div style={{ fontSize: '2rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-bright-blue)' }}>
            {successApp.applicationNumber}
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>
          Please save this tracking number. You will need it along with your email address to check your admission status.
        </p>

        <Link to="/apply/status" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
          Check Status Now
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Start Your Journey
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Apply for our open intake programs below and join the Scholaris community.
        </p>
      </div>

      {!selectedRegister ? (
        <>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--accent-bright-blue)" /> Open Intakes
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : registers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>There are currently no open admission periods. Please check back later.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {registers.map(reg => (
                <div key={reg.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => handleApplyClick(reg)}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>{reg.name}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={14} /> {reg.targetCourse}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> {reg.maxCapacity - (reg._count?.applications || 0)} spots left</span>
                    </div>
                  </div>
                  <button className="btn btn-primary">
                    Apply Now <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-bright-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Applying For</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedRegister.name}</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => setSelectedRegister(null)}>Back to Intakes</button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={18} /> Personal Information</h3>
            <div className="form-grid" style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input required type="text" name="firstName" className="form-input" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input type="text" name="middleName" className="form-input" value={formData.middleName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input required type="text" name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input required type="date" name="birthDate" className="form-input" value={formData.birthDate} onChange={handleChange} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={18} /> Contact Details</h3>
            <div className="form-grid" style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input required type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input required type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GraduationCap size={18} /> Academic Background</h3>
            <div className="form-grid" style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Previous Institution</label>
                <input type="text" name="previousInstitution" className="form-input" value={formData.previousInstitution} onChange={handleChange} placeholder="e.g. Lincoln High School" />
              </div>
              <div className="form-group">
                <label className="form-label">Previous Course/Grade</label>
                <input type="text" name="previousCourse" className="form-input" value={formData.previousCourse} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'} <FileText size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
