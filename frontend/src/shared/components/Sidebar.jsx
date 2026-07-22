import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  GraduationCap,
  ClipboardList,
  DollarSign,
  Calendar,
  UserCheck,
  Award,
  FileText,
  Home,
  Briefcase,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
  { id: 'admissions', label: 'Admissions',  icon: ClipboardList,   path: '/admissions' },
  { id: 'finance',    label: 'Finance',     icon: DollarSign,      path: '/finance' },
  { id: 'timetables', label: 'Timetables', icon: Calendar,        path: '/timetables' },
  { id: 'attendance', label: 'Attendance', icon: UserCheck,       path: '/attendance' },
  { id: 'exams',      label: 'Exams',      icon: Award,           path: '/exams' },
  { id: 'assignments',label: 'Assignments',icon: FileText,        path: '/assignments' },
  { id: 'library',    label: 'Library',    icon: BookOpen,        path: '/library' },
  { id: 'hr',         label: 'HR',         icon: Briefcase,       path: '/hr' },
  { id: 'students',   label: 'Students',    icon: Users,           path: '/students' },
  { id: 'courses',    label: 'Courses',     icon: BookOpen,        path: '/courses' },
  { id: 'departments',label: 'Departments', icon: Building2,       path: '/departments' },
  { id: 'faculty',    label: 'Faculty',     icon: GraduationCap,   path: '/faculty' },
];

const COMING_SOON_ITEMS = [
  { id: 'hostel', label: 'Hostel', icon: Home },
];

export default function Sidebar() {
  const config = useTheme();

  // Filter navigation items based on institutionConfig.modules toggles
  const activeNavItems = navItems.filter(item => config.modules?.[item.id] !== false);

  return (
    <aside className="sidebar">
      <div style={{ flex: 1 }}>
        {/* Brand */}
        <div className="brand-container">
          <div className="brand-logo">
            <img src={config.logo || '/logo.png'} alt={`${config.name} Logo`} />
          </div>
          <div>
            <div className="brand-title">{config.shortName || config.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>
              {config.tagline || 'Management Suite'}
            </div>
          </div>
        </div>

        {/* Nav section label */}
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          Navigation
        </div>

        <nav className="nav-group">
          {activeNavItems.map((item) => {
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
        {COMING_SOON_ITEMS.map((item) => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.9rem',
            padding: '0.65rem 1.1rem', borderRadius: '10px',
            color: 'var(--text-dim)', fontSize: '0.88rem', opacity: 0.6,
            cursor: 'not-allowed',
          }}>
            <span style={{ width: 17, height: 17, borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.07)' }}>
              🔒
            </span>
            {item.label}
          </div>
        ))}
      </div>

      {/* Student Portal quick link */}
      <div style={{ margin: '0 0.5rem 0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-bright-blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Student Access</div>
        <a href="/student/login" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <GraduationCap size={13} />
          Open Student Portal ↗
        </a>
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
