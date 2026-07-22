import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function PublicApplyLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Public Header */}
      <header style={{
        padding: '1.25rem 2.5rem',
        background: 'rgba(13, 19, 33, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #287AE7, #5147EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 25px rgba(59, 130, 246, 0.25)'
          }}>
            <GraduationCap size={24} color="white" />
          </div>
          <span style={{
            fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700,
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Scholaris
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/apply" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Open Admissions</Link>
          <Link to="/apply/status" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Check Status</Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        &copy; {new Date().getFullYear()} Scholaris Education System. All rights reserved.
      </footer>
    </div>
  );
}
