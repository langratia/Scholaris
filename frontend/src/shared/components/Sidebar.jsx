import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  GraduationCap,
  ClipboardList,
  DollarSign,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
  { id: 'admissions', label: 'Admissions',  icon: ClipboardList,   path: '/admissions' },
  { id: 'finance',    label: 'Finance',     icon: DollarSign,      path: '/finance' },
  { id: 'students',   label: 'Students',    icon: Users,           path: '/students' },
  { id: 'courses',    label: 'Courses',     icon: BookOpen,        path: '/courses' },
  { id: 'departments',label: 'Departments', icon: Building2,       path: '/departments' },
  { id: 'faculty',    label: 'Faculty',     icon: GraduationCap,   path: '/faculty' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div style={{ flex: 1 }}>
        {/* Brand */}
        <div className="brand-container">
          <div className="brand-logo">
            <img src="/logo.png" alt="Scholaris Logo" />
          </div>
          <div>
            <div className="brand-title">Scholaris</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>
              Management Suite
            </div>
          </div>
        </div>

        {/* Nav section label */}
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          Navigation
        </div>

        <nav className="nav-group">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0.75rem' }} />

        {/* Coming soon modules */}
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          Coming Soon
        </div>
        {['Timetables', 'Attendance', 'Exams', 'Library'].map((label) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: '0.9rem',
            padding: '0.65rem 1.1rem', borderRadius: '10px',
            color: 'var(--text-dim)', fontSize: '0.88rem', opacity: 0.6,
            cursor: 'not-allowed',
          }}>
            <span style={{ width: 17, height: 17, borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.07)' }}>
              🔒
            </span>
            {label}
          </div>
        ))}
      </div>

      {/* User badge */}
      <div className="user-badge">
        <div className="avatar-circle">AD</div>
        <div className="user-info">
          <div className="user-name">Admin User</div>
          <div className="user-role">System Administrator</div>
        </div>
      </div>
    </aside>
  );
}
