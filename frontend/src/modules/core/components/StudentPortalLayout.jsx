import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useStudentPortal } from '../context/StudentPortalContext';
import {
  LayoutDashboard, Calendar, CreditCard, UserCheck, LogOut, GraduationCap, Award, FileText, BookOpen,
} from 'lucide-react';

const NAV = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/schedule', label: 'Schedule', icon: Calendar },
  { to: '/student/billing', label: 'Billing', icon: CreditCard },
  { to: '/student/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/student/assignments', label: 'Assignments', icon: FileText },
  { to: '/student/library', label: 'Library', icon: BookOpen },
  { to: '/student/results', label: 'Results', icon: Award },
];

export default function StudentPortalLayout() {
  const { student, logout } = useStudentPortal();

  // Guard: redirect to login if no session
  if (!student) return <Navigate to="/student/login" replace />;

  const initials = `${student.name?.split(' ')[0]?.[0] ?? ''}${student.name?.split(' ')[1]?.[0] ?? ''}`.toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Top Navigation */}
      <header style={{
        padding: '0 2rem',
        height: '64px',
        background: 'rgba(13, 19, 33, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '1rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #287AE7, #5147EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={18} color="white" />
          </div>
          <span style={{
            fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 700,
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Scholaris <span style={{ fontWeight: 400, fontSize: '0.85rem', opacity: 0.7 }}>Student</span>
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
              })}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Profile + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #287AE7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', color: 'white',
          }}>
            {initials}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>{student.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{student.email}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '8px', color: 'var(--text-dim)', cursor: 'pointer',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
