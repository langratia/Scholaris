import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
  { id: 'admissions', label: 'Admissions',  icon: ClipboardList,   path: '/admissions' },
  { id: 'students',   label: 'Students',    icon: Users,           path: '/students' },
  { id: 'courses',    label: 'Courses',     icon: BookOpen,        path: '/courses' },
  { id: 'departments',label: 'Departments', icon: Building2,       path: '/departments' },
  { id: 'faculty',    label: 'Faculty',     icon: GraduationCap,   path: '/faculty' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand-container">
          <div className="brand-logo">
            <img src="/logo.png" alt="Scholaris Logo" />
          </div>
          <div className="brand-title">Scholaris</div>
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
                <Icon size={18} className="nav-icon" strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

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
