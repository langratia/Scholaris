import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { fetchStudentProfile } from '../../core/api/coreApi';
import { useStudentPortal } from '../context/StudentPortalContext';

export default function StudentLoginGate() {
  const { login } = useStudentPortal();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const profile = await fetchStudentProfile(email.trim());
      login(profile);
      navigate('/student', { replace: true });
    } catch (err) {
      setError('No student account found with that email address. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      backgroundImage: 'var(--bg-gradient)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '15%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(40,122,231,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '15%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(81,71,235,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px',
            background: 'linear-gradient(135deg, #287AE7, #5147EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 40px rgba(59,130,246,0.35)',
          }}>
            <GraduationCap size={36} color="white" />
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: '0.4rem',
          }}>
            Student Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Enter your student email to access your personal dashboard.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17,24,39,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {error && (
            <div style={{
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              padding: '0.85rem 1rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '12px', marginBottom: '1.5rem',
              color: '#f87171', fontSize: '0.88rem',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Student Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
            >
              {loading ? 'Signing in…' : 'Access My Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Your admission email address is used to access your account.
        </p>
      </div>
    </div>
  );
}
